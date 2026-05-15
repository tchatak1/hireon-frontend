import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  getNotifications,
  acceptHireRequest,
  refuseHireRequest,
  markNotificationRead,
} from '../utils/api';

// ── Swipeable row ─────────────────────────────────────────────────
function SwipeableRow({
  children,
  onSwipeRight,
  disabled = false,
}: {
  children: React.ReactNode;
  onSwipeRight: () => void;
  disabled?: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const THRESHOLD  = 80;
  const MAX_DRAG   = 110;

  const snapBack = () =>
    Animated.spring(translateX, {
      toValue:       0,
      useNativeDriver: false,
      tension:       120,
      friction:      10,
    }).start();

  const panResponder = useRef(
    PanResponder.create({
      // Claim horizontal swipes only
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        !disabled && Math.abs(dx) > Math.abs(dy) && dx > 5,
      onPanResponderGrant: () => {
        // Stop any ongoing animation so finger takes full control
        translateX.stopAnimation();
      },
      // Card follows finger in real time
      onPanResponderMove: (_, { dx }) => {
        translateX.setValue(Math.max(0, Math.min(dx, MAX_DRAG)));
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx >= THRESHOLD) onSwipeRight();
        snapBack(); // always return to origin
      },
      onPanResponderTerminate: () => snapBack(),
    })
  ).current;

  // Fade-in the action label as the card moves
  const actionOpacity = translateX.interpolate({
    inputRange:  [20, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={swipeStyles.container}>
      {/* Green action — fixed on the left, revealed as card slides right */}
      <Animated.View style={[swipeStyles.action, { opacity: actionOpacity }]}>
        <Ionicons name="checkmark-done" size={18} color="#fff" />
        <Text style={swipeStyles.actionText}>Mark as read</Text>
      </Animated.View>

      {/* Card slides right */}
      <Animated.View
        {...(disabled ? {} : panResponder.panHandlers)}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  action: {
    position:       'absolute',
    left:           12,
    top:            6,
    bottom:         6,
    width:          100,
    backgroundColor:'#27AE60',
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            4,
  },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default function NotificationsScreen({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      onUnreadChange?.(data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Accept request
  const handleAccept = async (
    requestId: string,
    notifId: string
  ) => {
    try {
      await acceptHireRequest(requestId);

      await markNotificationRead(notifId);

      Alert.alert(
        '✅ Accepted',
        'You accepted the hiring request'
      );

      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Refuse request
  const handleRefuse = async (
    requestId: string,
    notifId: string
  ) => {
    try {
      await refuseHireRequest(requestId);

      await markNotificationRead(notifId);

      Alert.alert(
        'Refused',
        'You refused the hiring request'
      );

      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Open location in maps
  const handleSeeLocation = (
    lat: number,
    lng: number
  ) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;

    Linking.openURL(url);
  };

  // Navigate to profile
  const handleViewProfile = async (item: any) => {
    try {
      if (!item.is_read) {
        await markNotificationRead(
          item.notification_id
        );
      }

      router.push({
        pathname: '/userProfile',
        params: {
          user_id:
            item.client?.id ||
            item.request?.client_id ||
            '',

          provider_name:
            item.client?.full_name ||
            item.client?.name ||
            'User',

          provider_image:
            item.client?.profile_picture ||
            '',

          provider_location:
            item.request?.address || '',

          provider_phone:
            item.client?.phone || '',

          provider_rating:
            item.client?.rating?.toString() ||
            '',
        },
      });
    } catch (err) {
      console.error(
        'Profile navigation error:',
        err
      );
    }
  };

  // Relative time: "2 mins ago", "3 hours ago", "Yesterday", etc.
  const getRelativeTime = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Just now';
    const diffMs   = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays  = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Check if notification is today
  const isToday = (dateStr: string) => {
    const today = new Date().toDateString();

    return (
      new Date(dateStr).toDateString() ===
      today
    );
  };

  // Split notifications
  const todayNotifs = notifications.filter(
    (n) =>
      isToday(
        n.created_at ||
          new Date().toISOString()
      )
  );

  const olderNotifs = notifications.filter(
    (n) =>
      !isToday(
        n.created_at ||
          new Date().toISOString()
      )
  );

  // Swipe right to mark as read
  const handleSwipeMarkRead = async (item: any) => {
    if (item.is_read) return;
    try {
      await markNotificationRead(item.notification_id);
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.notification_id === item.notification_id ? { ...n, is_read: true } : n
        );
        onUnreadChange?.(updated.filter(n => !n.is_read).length);
        return updated;
      });
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  // Render notification
  const renderNotification = ({
    item,
  }: {
    item: any;
  }) => {
    const isHireRequest =
      item.type === 'hire_request';

    const isPending =
      item.request?.status === 'pending';

    return (
      <SwipeableRow
        onSwipeRight={() => handleSwipeMarkRead(item)}
        disabled={item.is_read}
      >
        <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          handleViewProfile(item)
        }
      >
        <View
          style={[
            styles.notifCard,
            !item.is_read &&
              styles.notifUnread,
          ]}
        >
          <View style={styles.notifRow}>
            {/* Avatar */}
            <Image
              source={
                item.client?.profile_picture
                  ? {
                      uri:
                        item.client
                          .profile_picture,
                    }
                  : {
                      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    }
              }
              style={styles.avatar}
            />

            {/* Content */}
            <View style={styles.notifContent}>
              <Text style={styles.notifMessage}>
                {item.message}
              </Text>

              {item.request?.address && (
                <View
                  style={
                    styles.locationBadge
                  }
                >
                  <Ionicons
                    name="location-sharp"
                    size={12}
                    color="#FF9D00"
                  />

                  <Text
                    style={
                      styles.locationBadgeText
                    }
                  >
                    {item.request.address}
                  </Text>
                </View>
              )}

              <Text style={styles.notifTime}>
                {getRelativeTime(item.created_at)}
              </Text>
            </View>

            {/* Unread Dot */}
            {!item.is_read && (
              <View style={styles.unreadDot} />
            )}
          </View>

          {/* Pending hire request buttons */}
          {isHireRequest && isPending && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() =>
                  handleAccept(
                    item.hire_request_id,
                    item.notification_id
                  )
                }
              >
                <Text
                  style={
                    styles.acceptBtnText
                  }
                >
                  Accept
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.refuseBtn}
                onPress={() =>
                  handleRefuse(
                    item.hire_request_id,
                    item.notification_id
                  )
                }
              >
                <Text
                  style={
                    styles.refuseBtnText
                  }
                >
                  Refuse
                </Text>
              </TouchableOpacity>

              {item.request?.latitude && (
                <TouchableOpacity
                  style={
                    styles.locationBtn
                  }
                  onPress={() =>
                    handleSeeLocation(
                      item.request.latitude,
                      item.request.longitude
                    )
                  }
                >
                  <Text
                    style={
                      styles.locationBtnText
                    }
                  >
                    See location
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Accepted request — only show if job not yet completed */}
          {item.type ===
            'request_accepted' &&
            item.request &&
            item.request.status !== 'completed' && (
              <View
                style={styles.actionRow}
              >
                <TouchableOpacity
                  style={
                    styles.completeBtn
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        '/userProfile',

                      params: {
                        user_id: String(
                          item.request
                            .provider_id
                        ),

                        request_id: String(
                          item.hire_request_id
                        ),

                        can_complete:
                          'true',
                      },
                    })
                  }
                >
                  <Text
                    style={
                      styles.completeBtnText
                    }
                  >
                    Mark Completed &
                    Rate
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Completed jobs */}
          {item.type ===
            'job_completed' &&
            item.request && (
              <View
                style={styles.actionRow}
              >
                <TouchableOpacity
                  style={styles.rateBtn}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/userProfile',

                      params: {
                        user_id: String(
                          item.request
                            .provider_id
                        ),

                        request_id: String(
                          item.hire_request_id
                        ),

                        can_rate:
                          'true',
                      },
                    })
                  }
                >
                  <Text
                    style={
                      styles.rateBtnText
                    }
                  >
                    ⭐ Rate Provider
                  </Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </TouchableOpacity>
      </SwipeableRow>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator
          size="large"
          color="#FF9D00"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={32}
          color="#FF9D00"
        />

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerIcons}>
          <Ionicons
            name="search-outline"
            size={22}
            color="#111"
            style={{ marginRight: 16 }}
          />

          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color="#111"
          />
        </View>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9D00']}
          />
        }
        ListHeaderComponent={
          <>
            {notifications.length ===
            0 ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color="#ccc"
                />

                <Text style={styles.emptyText}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              <>
                {/* Today */}
                {todayNotifs.length >
                  0 &&
                  todayNotifs.map(
                    (item) => (
                      <View
                        key={
                          item.notification_id
                        }
                      >
                        {renderNotification(
                          {
                            item,
                          }
                        )}
                      </View>
                    )
                  )}

                {/* This Week */}
                {olderNotifs.length >
                  0 && (
                  <>
                    <View
                      style={
                        styles.sectionHeader
                      }
                    >
                      <Text
                        style={
                          styles.sectionTitle
                        }
                      >
                        This Week
                      </Text>

                      <Ionicons
                        name="chevron-up"
                        size={18}
                        color="#FF9D00"
                      />
                    </View>

                    {olderNotifs.map(
                      (item) => (
                        <View
                          key={
                            item.notification_id
                          }
                        >
                          {renderNotification({item, }
                          )}
                        </View>
                      )
                    )}
                  </>
                )}
              </>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 10,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notifCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#FFF8EE',
    borderRadius: 12,
    padding: 12,
  },

  notifUnread: {
    backgroundColor: '#FFF3DC',
  },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,

    borderWidth: 2,
    borderColor: '#FF9D00',
  },

  notifContent: {
    flex: 1,
  },

  notifMessage: {
    fontSize: 13,
    color: '#222',
    lineHeight: 18,
    fontWeight: '500',
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  locationBadgeText: {
    fontSize: 11,
    color: '#FF9D00',
  },

  notifTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF9D00',
    marginTop: 4,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginLeft: 56,
    flexWrap: 'wrap',
  },

  acceptBtn: {
    backgroundColor: '#FF9D00',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
  },

  acceptBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },

  refuseBtn: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
  },

  refuseBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },

  locationBtn: {
    borderWidth: 1,
    borderColor: '#FF9D00',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  locationBtnText: {
    color: '#FF9D00',
    fontSize: 13,
    fontWeight: '600',
  },

   completeBtn: {
  backgroundColor: '#27AE60', borderRadius: 8,
  paddingVertical: 8, paddingHorizontal: 16, flex: 1, alignItems: 'center',
},

  completeBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },

  rateBtn: {
  borderWidth: 1, borderColor: '#FF9D00', borderRadius: 8,
  paddingVertical: 8, paddingHorizontal: 16, flex: 1, alignItems: 'center',
},

  rateBtnText: { color: '#FF9D00', fontWeight: '600', fontSize: 13 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9D00',
  },

  emptyBox: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },

  emptyText: {
    fontSize: 15,
    color: '#999',
  },
});