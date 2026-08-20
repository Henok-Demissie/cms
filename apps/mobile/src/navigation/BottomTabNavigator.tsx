import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import type { Palette } from '../theme';
import {
  fetchComplaints,
  createComplaint,
  fetchComplaintDetails,
  replyComplaint,
  updateComplaint,
  withdrawComplaint,
  fetchSuggestions,
  createSuggestion,
  respondSuggestion,
  fetchFeedback,
  createFeedback,
  respondFeedback,
  fetchOrganizations,
  fetchNotifications,
  markNotificationsRead,
  type Complaint,
  type Suggestion,
  type FeedbackItem,
  type NotificationItem,
  type Organization,
} from '../api';

const Tab = createBottomTabNavigator();

/** A withdrawn or closed case is read-only for everyone. */
const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

// ==========================================
// 1. CASES / COMPLAINTS SCREEN
// ==========================================
function CasesScreen() {
  const { user, token, refreshDashboard } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isCustomer = user?.role === 'CUSTOMER';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Complaint Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [staffStatus, setStaffStatus] = useState('IN_PROGRESS');
  const [replying, setReplying] = useState(false);

  // Owner Edit / Withdraw State
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [complaintsData, orgsData] = await Promise.all([
        fetchComplaints(token),
        fetchOrganizations(),
      ]);
      setComplaints(complaintsData);
      setOrganizations(orgsData);
      if (orgsData.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgsData[0].id);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedOrgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateComplaint = async () => {
    if (!newTitle.trim() || !newDescription.trim() || !selectedOrgId) {
      Alert.alert('Missing Fields', 'Please enter title, description, and select an organization.');
      return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      await createComplaint(token, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        tenantId: selectedOrgId,
      });
      setCreateModalVisible(false);
      setNewTitle('');
      setNewDescription('');
      Alert.alert('Success', 'Your complaint has been submitted successfully.');
      loadData();
      refreshDashboard();
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = async (item: Complaint) => {
    setSelectedComplaint(item);
    setEditMode(false);
    setReplyText('');
    setDetailModalVisible(true);
    if (token) {
      try {
        const full = await fetchComplaintDetails(token, item.id);
        setSelectedComplaint(full);
      } catch {
        // fallback to item
      }
    }
  };

  const closeDetails = () => {
    setDetailModalVisible(false);
    setEditMode(false);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedComplaint || !token) return;
    setReplying(true);
    try {
      const result = await replyComplaint(
        token,
        selectedComplaint.id,
        replyText.trim(),
        !isCustomer ? staffStatus : undefined,
      );
      setSelectedComplaint(result.complaint);
      setReplyText('');
      loadData();
      refreshDashboard();
      Alert.alert('Message Sent', 'Your reply has been posted.');
    } catch (err: any) {
      Alert.alert('Reply Failed', err?.message || 'Try again');
    } finally {
      setReplying(false);
    }
  };

  // The server allows an edit only while the case is untouched — still NEW with
  // no replies — so the buttons follow the same rule instead of failing on tap.
  const isWithdrawn = selectedComplaint?.status === 'WITHDRAWN';
  const canEdit =
    isCustomer &&
    !!selectedComplaint &&
    selectedComplaint.status === 'NEW' &&
    (selectedComplaint.messages?.length ?? 0) === 0;
  const canWithdraw =
    isCustomer &&
    !!selectedComplaint &&
    !isWithdrawn &&
    !CLOSED_STATUSES.includes(selectedComplaint.status);

  const startEdit = () => {
    if (!selectedComplaint) return;
    setEditTitle(selectedComplaint.title);
    setEditDescription(selectedComplaint.description);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComplaint || !token) return;
    const title = editTitle.trim();
    const description = editDescription.trim();
    if (title.length < 3 || description.length < 10) {
      Alert.alert(
        'Check your text',
        'The title needs at least 3 characters and the description at least 10.',
      );
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await updateComplaint(token, selectedComplaint.id, { title, description });
      setSelectedComplaint(updated);
      setEditMode(false);
      loadData();
      refreshDashboard();
      Alert.alert('Saved', 'Your complaint has been updated.');
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Try again');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleWithdraw = () => {
    if (!selectedComplaint || !token) return;
    const id = selectedComplaint.id;
    Alert.alert(
      'Withdraw this complaint?',
      'The organization keeps the record, but the case is closed and nobody can reply to it anymore.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setWithdrawing(true);
            try {
              await withdrawComplaint(token, id);
              closeDetails();
              setSelectedComplaint(null);
              loadData();
              refreshDashboard();
              Alert.alert('Withdrawn', 'Your complaint has been withdrawn.');
            } catch (err: any) {
              Alert.alert('Withdraw Failed', err?.message || 'Try again');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ],
    );
  };

  const statusTone = (status: string) => {
    if (CLOSED_STATUSES.includes(status)) {
      return { box: styles.statusResolved, text: styles.statusTextResolved };
    }
    if (status === 'WITHDRAWN') {
      return { box: styles.statusWithdrawn, text: styles.statusTextWithdrawn };
    }
    return { box: styles.statusActive, text: styles.statusTextActive };
  };

  return (
    <SafeAreaView style={styles.tabContainer}>
      {/* Header */}
      <View style={styles.tabHeader}>
        <View>
          <Text style={styles.tabHeaderTag}>{isCustomer ? 'CUSTOMER PORTAL' : 'STAFF WORKSPACE'}</Text>
          <Text style={styles.tabHeaderTitle}>{isCustomer ? 'My Complaints' : 'Incoming Cases'}</Text>
        </View>
        {isCustomer && (
          <Pressable style={styles.headerActionBtn} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add" size={18} color={palette.onPrimary} />
            <Text style={styles.headerActionBtnText}>New Case</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          {complaints.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={palette.muted} />
              <Text style={styles.emptyTitle}>No cases found</Text>
              <Text style={styles.emptySub}>
                {isCustomer ? 'Tap "+ New Case" to submit a complaint to any organization.' : 'No cases submitted to your organization yet.'}
              </Text>
            </View>
          ) : (
            complaints.map((item) => {
              const tone = statusTone(item.status);
              return (
                <Pressable key={item.id} style={styles.itemCard} onPress={() => openDetails(item)}>
                  <View style={styles.itemCardHeader}>
                    <Text style={styles.itemCardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.statusBadge, tone.box]}>
                      <Text style={[styles.statusBadgeText, tone.text]}>{item.status.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>

                  <Text style={styles.itemCardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.itemCardFooter}>
                    {isCustomer ? (
                      <Text style={styles.metaTextOrg}>🏢 {item.tenant?.name || 'Organization'}</Text>
                    ) : (
                      <Text style={styles.metaTextCustomer}>👤 {item.customerName || 'Customer'}</Text>
                    )}
                    <View style={styles.metaRight}>
                      {item.messages && item.messages.length > 0 && (
                        <View style={styles.repliesCountBadge}>
                          <Ionicons name="chatbubble-outline" size={11} color={palette.primary} />
                          <Text style={styles.repliesCountText}>{item.messages.length}</Text>
                        </View>
                      )}
                      <Text style={styles.metaDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* CREATE COMPLAINT MODAL */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Complaint</Text>
              <Pressable onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Select Target Organization</Text>
              <View style={styles.orgPickerRow}>
                {organizations.map((org) => (
                  <Pressable
                    key={org.id}
                    style={[styles.orgChip, selectedOrgId === org.id && styles.orgChipActive]}
                    onPress={() => setSelectedOrgId(org.id)}
                  >
                    <Text style={[styles.orgChipText, selectedOrgId === org.id && styles.orgChipTextActive]}>
                      🏢 {org.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Complaint Title</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Delayed service / billing error"
                placeholderTextColor={palette.muted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.fieldLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Describe your issue with all necessary details..."
                placeholderTextColor={palette.muted}
                multiline
                numberOfLines={4}
                value={newDescription}
                onChangeText={setNewDescription}
              />

              <Pressable
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleCreateComplaint}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={palette.onPrimary} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Complaint</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DETAILS / MESSAGING MODAL */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTag}>
                  🏢 {selectedComplaint?.tenant?.name || 'Organization'}
                </Text>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {editMode ? 'Edit Complaint' : selectedComplaint?.title}
                </Text>
              </View>
              <Pressable onPress={closeDetails}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            {editMode ? (
              /* ---------- EDIT FORM (customer, untouched case only) ---------- */
              <ScrollView style={styles.modalBody}>
                <Text style={styles.editHint}>
                  You can still change this case because no one from the organization has replied yet.
                </Text>

                <Text style={styles.fieldLabel}>Complaint Title</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Delayed service / billing error"
                  placeholderTextColor={palette.muted}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                <Text style={styles.fieldLabel}>Detailed Description</Text>
                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  placeholder="Describe your issue with all necessary details..."
                  placeholderTextColor={palette.muted}
                  multiline
                  value={editDescription}
                  onChangeText={setEditDescription}
                />

                <View style={styles.editActionsRow}>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => setEditMode(false)}
                    disabled={savingEdit}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveBtn, savingEdit && styles.btnDisabled]}
                    onPress={handleSaveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <ActivityIndicator color={palette.onPrimary} />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            ) : (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailInfoBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={styles.detailValue}>{selectedComplaint?.status.replace(/_/g, ' ')}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{selectedComplaint?.customerName || selectedComplaint?.customerEmail || 'Customer'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted:</Text>
                    <Text style={styles.detailValue}>
                      {selectedComplaint?.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString() : ''}
                    </Text>
                  </View>
                  <Text style={[styles.detailLabel, { marginTop: 8 }]}>Original Description:</Text>
                  <Text style={styles.detailDesc}>{selectedComplaint?.description}</Text>
                </View>

                {/* Owner actions: edit while untouched, withdraw until resolved */}
                {isCustomer && (canEdit || canWithdraw) && (
                  <View style={styles.ownerActionsRow}>
                    {canEdit && (
                      <Pressable style={styles.ownerActionBtn} onPress={startEdit}>
                        <Ionicons name="create-outline" size={15} color={palette.primary} />
                        <Text style={styles.ownerActionText}>Edit</Text>
                      </Pressable>
                    )}
                    {canWithdraw && (
                      <Pressable
                        style={[styles.ownerActionBtn, styles.ownerActionBtnDanger, withdrawing && styles.btnDisabled]}
                        onPress={handleWithdraw}
                        disabled={withdrawing}
                      >
                        {withdrawing ? (
                          <ActivityIndicator size="small" color={palette.danger} />
                        ) : (
                          <>
                            <Ionicons name="trash-outline" size={15} color={palette.danger} />
                            <Text style={[styles.ownerActionText, styles.ownerActionTextDanger]}>Withdraw</Text>
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                )}

                {isCustomer && !canEdit && !isWithdrawn && (
                  <Text style={styles.lockedHint}>
                    This case is already being handled, so the original text can no longer be edited.
                  </Text>
                )}

                {/* Message Thread */}
                <Text style={styles.sectionHeading}>Conversation & Staff Responses</Text>
                {selectedComplaint?.messages && selectedComplaint.messages.length > 0 ? (
                  selectedComplaint.messages.map((msg) => {
                    const isStaffMsg = msg.authorRole ? msg.authorRole !== 'CUSTOMER' : (msg.author ? msg.author.role !== 'CUSTOMER' : false);
                    const authorName = msg.authorName || msg.author?.name || msg.customer?.name || (isStaffMsg ? 'Staff' : 'Customer');
                    return (
                      <View
                        key={msg.id}
                        style={[styles.messageBubble, isStaffMsg ? styles.staffBubble : styles.customerBubble]}
                      >
                        <View style={styles.msgHeader}>
                          <Text style={styles.msgAuthor}>
                            {authorName}{' '}
                            {isStaffMsg && <Text style={styles.staffTag}>(Staff Response)</Text>}
                          </Text>
                          <Text style={styles.msgTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={styles.msgBody}>{msg.message}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noMessagesText}>No replies yet.</Text>
                )}

                {isWithdrawn ? (
                  <View style={styles.withdrawnNotice}>
                    <Ionicons name="close-circle-outline" size={16} color={palette.muted} />
                    <Text style={styles.withdrawnNoticeText}>
                      This complaint was withdrawn. The thread is closed, so no further replies can be posted.
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Staff Status Selector */}
                    {!isCustomer && (
                      <View style={styles.statusSelectorRow}>
                        <Text style={styles.fieldLabel}>Update Case Status:</Text>
                        <View style={styles.statusPills}>
                          {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                            <Pressable
                              key={st}
                              style={[styles.statusPill, staffStatus === st && styles.statusPillActive]}
                              onPress={() => setStaffStatus(st)}
                            >
                              <Text style={[styles.statusPillText, staffStatus === st && styles.statusPillTextActive]}>
                                {st.replace(/_/g, ' ')}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Reply Input */}
                    <Text style={styles.fieldLabel}>
                      {isCustomer ? 'Send Follow-up Message' : 'Send Staff Response'}
                    </Text>
                    <TextInput
                      style={[styles.inputField, { minHeight: 70 }]}
                      placeholder={isCustomer ? 'Write a follow-up...' : 'Write official staff response...'}
                      placeholderTextColor={palette.muted}
                      multiline
                      value={replyText}
                      onChangeText={setReplyText}
                    />

                    <Pressable
                      style={[styles.submitBtn, replying && styles.btnDisabled]}
                      onPress={handleSendReply}
                      disabled={replying}
                    >
                      {replying ? (
                        <ActivityIndicator color={palette.onPrimary} />
                      ) : (
                        <Text style={styles.submitBtnText}>
                          {isCustomer ? 'Send Message' : 'Post Staff Response'}
                        </Text>
                      )}
                    </Pressable>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 2. SUGGESTIONS & FEEDBACK SCREEN
// ==========================================
function SuggestionsScreen() {
  const { user, token, refreshDashboard } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isCustomer = user?.role === 'CUSTOMER';

  const [activeTab, setActiveTab] = useState<'SUGGESTIONS' | 'FEEDBACK'>('SUGGESTIONS');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Inputs
  const [createModal, setCreateModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [suggTitle, setSuggTitle] = useState('');
  const [suggDesc, setSuggDesc] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Staff Respond Modal
  const [respondModal, setRespondModal] = useState(false);
  const [activeItem, setActiveItem] = useState<{ id: string; type: 'SUGGESTION' | 'FEEDBACK'; title?: string; msg?: string } | null>(null);
  const [responseText, setResponseText] = useState('');
  const [suggStatus, setSuggStatus] = useState<'ACCEPTED' | 'IN_REVIEW' | 'DECLINED'>('ACCEPTED');
  const [responding, setResponding] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [suggs, fbs, orgs] = await Promise.all([
        fetchSuggestions(token),
        fetchFeedback(token),
        fetchOrganizations(),
      ]);
      setSuggestions(suggs);
      setFeedbackList(fbs);
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgs[0].id);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedOrgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!token || !selectedOrgId) {
      Alert.alert('Missing Field', 'Select an organization.');
      return;
    }
    setSubmitting(true);
    try {
      if (activeTab === 'SUGGESTIONS') {
        if (!suggTitle.trim() || !suggDesc.trim()) {
          Alert.alert('Required', 'Enter title and description.');
          setSubmitting(false);
          return;
        }
        await createSuggestion(token, {
          title: suggTitle.trim(),
          description: suggDesc.trim(),
          tenantId: selectedOrgId,
        });
        setSuggTitle('');
        setSuggDesc('');
        Alert.alert('Thank You', 'Suggestion sent to organization.');
      } else {
        if (!feedbackMsg.trim()) {
          Alert.alert('Required', 'Enter feedback message.');
          setSubmitting(false);
          return;
        }
        await createFeedback(token, {
          message: feedbackMsg.trim(),
          rating,
          tenantId: selectedOrgId,
        });
        setFeedbackMsg('');
        Alert.alert('Thank You', 'Feedback submitted.');
      }
      setCreateModal(false);
      loadData();
      refreshDashboard();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!token || !activeItem || !responseText.trim()) return;
    setResponding(true);
    try {
      if (activeItem.type === 'SUGGESTION') {
        await respondSuggestion(token, activeItem.id, responseText.trim(), suggStatus);
      } else {
        await respondFeedback(token, activeItem.id, responseText.trim());
      }
      setRespondModal(false);
      setResponseText('');
      loadData();
      refreshDashboard();
      Alert.alert('Success', 'Response submitted.');
    } catch (err: any) {
      Alert.alert('Failed', err?.message || 'Error');
    } finally {
      setResponding(false);
    }
  };

  return (
    <SafeAreaView style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <View>
          <Text style={styles.tabHeaderTag}>{isCustomer ? 'CUSTOMER PORTAL' : 'STAFF WORKSPACE'}</Text>
          <Text style={styles.tabHeaderTitle}>Suggestions & Feedback</Text>
        </View>
        {isCustomer && (
          <Pressable style={styles.headerActionBtn} onPress={() => setCreateModal(true)}>
            <Ionicons name="add" size={18} color={palette.onPrimary} />
            <Text style={styles.headerActionBtnText}>
              {activeTab === 'SUGGESTIONS' ? 'Suggest' : 'Feedback'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Segmented Switch */}
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segmentBtn, activeTab === 'SUGGESTIONS' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('SUGGESTIONS')}
        >
          <Text style={[styles.segmentText, activeTab === 'SUGGESTIONS' && styles.segmentTextActive]}>
            💡 Suggestions ({suggestions.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, activeTab === 'FEEDBACK' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('FEEDBACK')}
        >
          <Text style={[styles.segmentText, activeTab === 'FEEDBACK' && styles.segmentTextActive]}>
            💬 Feedback ({feedbackList.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          {activeTab === 'SUGGESTIONS' ? (
            suggestions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bulb-outline" size={48} color={palette.muted} />
                <Text style={styles.emptyTitle}>No suggestions</Text>
                <Text style={styles.emptySub}>
                  {isCustomer ? 'Submit ideas to any organization to help improve their service.' : 'No suggestions submitted yet.'}
                </Text>
              </View>
            ) : (
              suggestions.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <Text style={styles.itemCardTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemCardDesc}>{item.description}</Text>
                  <Text style={styles.metaTextOrg}>🏢 {item.tenant?.name}</Text>

                  {/* Staff Response display */}
                  {item.response && (
                    <View style={styles.responseBox}>
                      <Text style={styles.responseBoxTitle}>Company Response:</Text>
                      <Text style={styles.responseBoxText}>{item.response}</Text>
                    </View>
                  )}

                  {!isCustomer && (
                    <Pressable
                      style={styles.replyActionBtn}
                      onPress={() => {
                        setActiveItem({ id: item.id, type: 'SUGGESTION', title: item.title });
                        setResponseText(item.response || '');
                        setRespondModal(true);
                      }}
                    >
                      <Ionicons name="chatbox-ellipses-outline" size={14} color={palette.primary} />
                      <Text style={styles.replyActionText}>{item.response ? 'Update Staff Response' : 'Respond to Suggestion'}</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )
          ) : (
            feedbackList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={palette.muted} />
                <Text style={styles.emptyTitle}>No feedback</Text>
                <Text style={styles.emptySub}>
                  {isCustomer ? 'Share ratings and feedback about your experiences.' : 'No feedback submitted yet.'}
                </Text>
              </View>
            ) : (
              feedbackList.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <Text style={styles.ratingStars}>
                      {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))} ({item.rating || 5}/5)
                    </Text>
                    <Text style={styles.metaDate}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.itemCardDesc}>{item.message}</Text>
                  <Text style={styles.metaTextOrg}>🏢 {item.tenant?.name}</Text>

                  {item.response && (
                    <View style={styles.responseBox}>
                      <Text style={styles.responseBoxTitle}>Company Response:</Text>
                      <Text style={styles.responseBoxText}>{item.response}</Text>
                    </View>
                  )}

                  {!isCustomer && (
                    <Pressable
                      style={styles.replyActionBtn}
                      onPress={() => {
                        setActiveItem({ id: item.id, type: 'FEEDBACK', msg: item.message });
                        setResponseText(item.response || '');
                        setRespondModal(true);
                      }}
                    >
                      <Ionicons name="chatbox-ellipses-outline" size={14} color={palette.primary} />
                      <Text style={styles.replyActionText}>{item.response ? 'Update Staff Response' : 'Reply to Feedback'}</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )
          )}
        </ScrollView>
      )}

      {/* CREATE SUGGESTION / FEEDBACK MODAL */}
      <Modal visible={createModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'SUGGESTIONS' ? 'Submit Suggestion' : 'Send Feedback'}
              </Text>
              <Pressable onPress={() => setCreateModal(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Select Organization</Text>
              <View style={styles.orgPickerRow}>
                {organizations.map((org) => (
                  <Pressable
                    key={org.id}
                    style={[styles.orgChip, selectedOrgId === org.id && styles.orgChipActive]}
                    onPress={() => setSelectedOrgId(org.id)}
                  >
                    <Text style={[styles.orgChipText, selectedOrgId === org.id && styles.orgChipTextActive]}>
                      🏢 {org.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {activeTab === 'SUGGESTIONS' ? (
                <>
                  <Text style={styles.fieldLabel}>Suggestion Title</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Short idea title"
                    placeholderTextColor={palette.muted}
                    value={suggTitle}
                    onChangeText={setSuggTitle}
                  />
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.inputField, styles.textArea]}
                    placeholder="Describe how the company can improve..."
                    placeholderTextColor={palette.muted}
                    multiline
                    value={suggDesc}
                    onChangeText={setSuggDesc}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>Rating (1 to 5)</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Pressable key={st} onPress={() => setRating(st)}>
                        <Ionicons
                          name={st <= rating ? 'star' : 'star-outline'}
                          size={32}
                          color={palette.amber}
                          style={{ marginHorizontal: 4 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>Your Feedback Message</Text>
                  <TextInput
                    style={[styles.inputField, styles.textArea]}
                    placeholder="Tell us about your experience..."
                    placeholderTextColor={palette.muted}
                    multiline
                    value={feedbackMsg}
                    onChangeText={setFeedbackMsg}
                  />
                </>
              )}

              <Pressable
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={palette.onPrimary} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* STAFF RESPOND MODAL */}
      <Modal visible={respondModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Staff Response</Text>
              <Pressable onPress={() => setRespondModal(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeItem?.type === 'SUGGESTION' && (
                <>
                  <Text style={styles.fieldLabel}>Update Status:</Text>
                  <View style={styles.statusPills}>
                    {(['ACCEPTED', 'IN_REVIEW', 'DECLINED'] as const).map((st) => (
                      <Pressable
                        key={st}
                        style={[styles.statusPill, suggStatus === st && styles.statusPillActive]}
                        onPress={() => setSuggStatus(st)}
                      >
                        <Text style={[styles.statusPillText, suggStatus === st && styles.statusPillTextActive]}>
                          {st.replace(/_/g, ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>Response Message</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Write company response..."
                placeholderTextColor={palette.muted}
                multiline
                value={responseText}
                onChangeText={setResponseText}
              />

              <Pressable
                style={[styles.submitBtn, responding && styles.btnDisabled]}
                onPress={handleRespond}
                disabled={responding}
              >
                {responding ? (
                  <ActivityIndicator color={palette.onPrimary} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Response</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 3. NOTIFICATIONS / ALERTS SCREEN
// ==========================================
function NotificationsScreen() {
  const { token, refreshDashboard } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications(token);
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markNotificationsRead(token, undefined, true);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshDashboard();
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <View>
          <Text style={styles.tabHeaderTag}>ALERTS & REPLIES</Text>
          <Text style={styles.tabHeaderTitle}>Notifications</Text>
        </View>
        {notifications.some((n) => !n.read) && (
          <Pressable style={styles.markReadHeaderBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={16} color={palette.primary} />
            <Text style={styles.markReadHeaderText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={48} color={palette.muted} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySub}>
                When company staff replies to your cases, you will receive notifications here.
              </Text>
            </View>
          ) : (
            notifications.map((n) => (
              <View
                key={n.id}
                style={[
                  styles.itemCard,
                  !n.read && styles.notifUnreadCard,
                ]}
              >
                <View style={styles.itemCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Ionicons
                      name={
                        n.type === 'COMPLAINT_REPLY'
                          ? 'chatbubble-ellipses'
                          : n.type === 'SUGGESTION_RESPONSE'
                          ? 'bulb'
                          : 'notifications'
                      }
                      size={16}
                      color={palette.primary}
                    />
                    <Text style={styles.itemCardTitle} numberOfLines={1}>
                      {n.title}
                    </Text>
                  </View>
                  {!n.read && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemCardDesc}>{n.message}</Text>
                <Text style={styles.metaDate}>
                  {new Date(n.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ==========================================
// 4. PROFILE SCREEN
// ==========================================
function ProfileScreen() {
  const { user, dashboard, signOut, uiLang, setUiLang } = useAuth();
  const { palette, mode, setMode, isExplicit } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isCustomer = user?.role === 'CUSTOMER';
  const orgName = dashboard?.tenant?.name;

  return (
    <SafeAreaView style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <View>
          <Text style={styles.tabHeaderTag}>ACCOUNT & SETTINGS</Text>
          <Text style={styles.tabHeaderTitle}>User Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {isCustomer ? '👤 Customer Account' : `🏢 Staff (${user?.role})`}
            </Text>
          </View>

          {orgName && (
            <Text style={styles.profileOrg}>Organization: {orgName}</Text>
          )}
        </View>

        {/* Appearance (dark / bright mode) */}
        <View style={styles.settingCard}>
          <Text style={styles.settingTitle}>Appearance</Text>
          <View style={styles.langToggleRow}>
            <Pressable
              style={[styles.langBtn, mode === 'light' && styles.langBtnActive]}
              onPress={() => setMode('light')}
              accessibilityRole="button"
              accessibilityLabel="Use bright mode"
            >
              <Ionicons
                name="sunny-outline"
                size={15}
                color={mode === 'light' ? palette.primary : palette.muted}
              />
              <Text style={[styles.langBtnText, mode === 'light' && styles.langBtnTextActive]}>
                Bright
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langBtn, mode === 'dark' && styles.langBtnActive]}
              onPress={() => setMode('dark')}
              accessibilityRole="button"
              accessibilityLabel="Use dark mode"
            >
              <Ionicons
                name="moon-outline"
                size={15}
                color={mode === 'dark' ? palette.primary : palette.muted}
              />
              <Text style={[styles.langBtnText, mode === 'dark' && styles.langBtnTextActive]}>
                Dark
              </Text>
            </Pressable>
          </View>
          {!isExplicit && (
            <Text style={styles.settingHint}>Currently following your device setting.</Text>
          )}
        </View>

        {/* Language Selection */}
        <View style={styles.settingCard}>
          <Text style={styles.settingTitle}>Interface Language</Text>
          <View style={styles.langToggleRow}>
            <Pressable
              style={[styles.langBtn, uiLang === 'AM' && styles.langBtnActive]}
              onPress={() => setUiLang('AM')}
            >
              <Text style={[styles.langBtnText, uiLang === 'AM' && styles.langBtnTextActive]}>
                አማርኛ (Amharic)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langBtn, uiLang === 'EN' && styles.langBtnActive]}
              onPress={() => setUiLang('EN')}
            >
              <Text style={[styles.langBtnText, uiLang === 'EN' && styles.langBtnTextActive]}>
                English
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOutCardBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={palette.danger} />
          <Text style={styles.signOutCardText}>Sign Out of Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 5. MAIN BOTTOM TAB NAVIGATOR
// ==========================================
export function BottomTabNavigator() {
  const { user } = useAuth();
  const { palette } = useTheme();
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.borderSoft,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Cases') iconName = focused ? 'folder-open' : 'folder-outline';
          else if (route.name === 'Suggestions') iconName = focused ? 'bulb' : 'bulb-outline';
          else if (route.name === 'Alerts') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Cases" component={CasesScreen} />
      <Tab.Screen name="Suggestions" component={SuggestionsScreen} />
      {isCustomer && (
        <Tab.Screen name="Alerts" component={NotificationsScreen} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    tabContainer: {
      flex: 1,
      backgroundColor: p.bg,
    },
    tabHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: p.borderSoft,
    },
    tabHeaderTag: {
      fontSize: 10,
      fontWeight: '700',
      color: p.primary,
      letterSpacing: 1,
    },
    tabHeaderTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: p.text,
      marginTop: 2,
    },
    headerActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: p.primarySolid,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
    },
    headerActionBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: p.onPrimary,
    },
    markReadHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: p.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    markReadHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      color: p.primary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: p.text,
      marginTop: 12,
    },
    emptySub: {
      fontSize: 13,
      color: p.muted,
      textAlign: 'center',
      marginTop: 6,
    },
    itemCard: {
      backgroundColor: p.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: p.border,
      shadowColor: p.shadow,
      shadowOpacity: 0.03,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    notifUnreadCard: {
      borderColor: p.primary,
      backgroundColor: p.primarySofter,
    },
    newBadge: {
      backgroundColor: p.primarySoft,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    newBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: p.primary,
    },
    itemCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    itemCardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: p.text,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      backgroundColor: p.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusResolved: {
      backgroundColor: p.successSoft,
    },
    statusActive: {
      backgroundColor: p.infoSoft,
    },
    statusWithdrawn: {
      backgroundColor: p.surfaceRaised,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: p.primary,
    },
    statusTextResolved: {
      color: p.success,
    },
    statusTextActive: {
      color: p.info,
    },
    statusTextWithdrawn: {
      color: p.muted,
    },
    itemCardDesc: {
      fontSize: 13,
      color: p.muted,
      lineHeight: 18,
      marginBottom: 10,
    },
    itemCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: p.borderSoft,
      paddingTop: 8,
    },
    metaTextOrg: {
      fontSize: 12,
      fontWeight: '600',
      color: p.primary,
    },
    metaTextCustomer: {
      fontSize: 12,
      fontWeight: '600',
      color: p.text,
    },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    repliesCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: p.primarySoft,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    repliesCountText: {
      fontSize: 10,
      fontWeight: '600',
      color: p.primary,
    },
    metaDate: {
      fontSize: 11,
      color: p.muted,
    },
    segmentedControl: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 6,
      backgroundColor: p.bgSoft,
      borderRadius: 12,
      padding: 3,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 10,
    },
    segmentBtnActive: {
      backgroundColor: p.surface,
      shadowColor: p.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    segmentText: {
      fontSize: 12,
      fontWeight: '600',
      color: p.muted,
    },
    segmentTextActive: {
      color: p.text,
    },
    ratingStars: {
      fontSize: 13,
      fontWeight: '600',
      color: p.amber,
    },
    responseBox: {
      backgroundColor: p.primarySofter,
      borderRadius: 10,
      padding: 10,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: p.primary,
    },
    responseBoxTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: p.primary,
      marginBottom: 2,
    },
    responseBoxText: {
      fontSize: 12,
      color: p.text,
    },
    replyActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 8,
      paddingVertical: 4,
    },
    replyActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: p.primary,
    },
    // Owner (customer) actions on their own case
    ownerActionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    ownerActionBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: p.primaryBorder,
      backgroundColor: p.primarySoft,
    },
    ownerActionBtnDanger: {
      borderColor: p.danger,
      backgroundColor: p.dangerSoft,
    },
    ownerActionText: {
      fontSize: 13,
      fontWeight: '700',
      color: p.primary,
    },
    ownerActionTextDanger: {
      color: p.danger,
    },
    lockedHint: {
      fontSize: 11,
      color: p.muted,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    editHint: {
      fontSize: 12,
      color: p.muted,
      lineHeight: 17,
      marginBottom: 4,
    },
    editActionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
      marginBottom: 24,
    },
    cancelBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.bgSoft,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: p.muted,
    },
    saveBtn: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: p.primarySolid,
    },
    saveBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: p.onPrimary,
    },
    withdrawnNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: p.bgSoft,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      marginBottom: 24,
    },
    withdrawnNoticeText: {
      flex: 1,
      fontSize: 12,
      color: p.muted,
      lineHeight: 17,
    },
    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: p.overlay,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: p.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      paddingBottom: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      borderBottomWidth: 1,
      borderBottomColor: p.borderSoft,
    },
    modalHeaderTag: {
      fontSize: 11,
      fontWeight: '700',
      color: p.primary,
      marginBottom: 2,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: p.text,
    },
    modalBody: {
      padding: 18,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: p.text,
      marginTop: 10,
      marginBottom: 6,
    },
    orgPickerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    orgChip: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: p.bgSoft,
    },
    orgChipActive: {
      borderColor: p.primary,
      backgroundColor: p.primarySoft,
    },
    orgChipText: {
      fontSize: 12,
      color: p.text,
      fontWeight: '500',
    },
    orgChipTextActive: {
      color: p.primary,
      fontWeight: '700',
    },
    inputField: {
      backgroundColor: p.bgSoft,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: p.text,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    starRow: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    submitBtn: {
      backgroundColor: p.primarySolid,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 18,
      marginBottom: 24,
    },
    submitBtnText: {
      color: p.onPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    btnDisabled: {
      opacity: 0.6,
    },
    // Details Modal styles
    detailInfoBox: {
      backgroundColor: p.bgSoft,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: p.muted,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: '600',
      color: p.text,
    },
    detailDesc: {
      fontSize: 13,
      color: p.text,
      lineHeight: 18,
      marginTop: 2,
    },
    sectionHeading: {
      fontSize: 14,
      fontWeight: '700',
      color: p.text,
      marginTop: 10,
      marginBottom: 8,
    },
    messageBubble: {
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
    },
    staffBubble: {
      backgroundColor: p.primarySoft,
      borderLeftWidth: 3,
      borderLeftColor: p.primary,
    },
    customerBubble: {
      backgroundColor: p.bgSoft,
      borderLeftWidth: 3,
      borderLeftColor: p.border,
    },
    msgHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    msgAuthor: {
      fontSize: 11,
      fontWeight: '700',
      color: p.text,
    },
    staffTag: {
      color: p.primary,
      fontSize: 10,
    },
    msgTime: {
      fontSize: 10,
      color: p.muted,
    },
    msgBody: {
      fontSize: 13,
      color: p.text,
    },
    noMessagesText: {
      fontSize: 12,
      color: p.muted,
      fontStyle: 'italic',
      marginBottom: 10,
    },
    statusSelectorRow: {
      marginTop: 8,
    },
    statusPills: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
      marginBottom: 10,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: p.bgSoft,
    },
    statusPillActive: {
      backgroundColor: p.primarySolid,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: p.muted,
    },
    statusPillTextActive: {
      color: p.onPrimary,
      fontWeight: '700',
    },
    // Profile styles
    profileCard: {
      alignItems: 'center',
      backgroundColor: p.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: p.border,
      marginBottom: 14,
    },
    avatarCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: p.primarySolid,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarText: {
      fontSize: 22,
      fontWeight: '700',
      color: p.onPrimary,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: p.text,
    },
    profileEmail: {
      fontSize: 13,
      color: p.muted,
      marginTop: 2,
    },
    roleTag: {
      backgroundColor: p.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
    },
    roleTagText: {
      fontSize: 12,
      fontWeight: '700',
      color: p.primary,
    },
    profileOrg: {
      fontSize: 12,
      color: p.muted,
      marginTop: 8,
      fontWeight: '500',
    },
    settingCard: {
      backgroundColor: p.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: p.border,
      marginBottom: 14,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: p.text,
      marginBottom: 10,
    },
    settingHint: {
      fontSize: 11,
      color: p.muted,
      marginTop: 8,
    },
    langToggleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    langBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: p.bgSoft,
      borderWidth: 1,
      borderColor: p.border,
    },
    langBtnActive: {
      borderColor: p.primary,
      backgroundColor: p.primarySoft,
    },
    langBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: p.muted,
    },
    langBtnTextActive: {
      color: p.primary,
      fontWeight: '700',
    },
    signOutCardBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      backgroundColor: p.dangerSoft,
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 4,
    },
    signOutCardText: {
      fontSize: 14,
      fontWeight: '700',
      color: p.danger,
    },
  });
