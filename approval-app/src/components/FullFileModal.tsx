/**
 * Full File Modal Component
 * Displays file contents in a full-screen modal
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, IconButton, ActivityIndicator, Surface } from 'react-native-paper';
import { api } from '../api/client';

interface FullFileModalProps {
  visible: boolean;
  filePath: string | null;
  onDismiss: () => void;
}

export function FullFileModal({ visible, filePath, onDismiss }: FullFileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{
    content: string;
    size: number;
    path: string;
  } | null>(null);

  useEffect(() => {
    if (visible && filePath) {
      loadFile();
    } else {
      // Reset state when modal closes
      setFileData(null);
      setError(null);
    }
  }, [visible, filePath]);

  const loadFile = async () => {
    if (!filePath) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.readFile(filePath);
      setFileData({
        content: data.content,
        size: data.size,
        path: data.file_path,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
      console.error('Error loading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileName = () => {
    if (!filePath) return 'File';
    const parts = filePath.split('/');
    return parts[parts.length - 1] || 'File';
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.surface}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text variant="headlineSmall" style={styles.title}>
                📄 {getFileName()}
              </Text>
              {fileData && (
                <Text variant="bodySmall" style={styles.subtitle}>
                  {formatSize(fileData.size)}
                </Text>
              )}
            </View>
            <IconButton
              icon="close"
              size={28}
              onPress={onDismiss}
              iconColor="#fff"
              style={styles.closeButton}
            />
          </View>

          {/* File Path Info */}
          {fileData && (
            <View style={styles.infoBar}>
              <Text variant="bodySmall" style={styles.infoText} numberOfLines={1}>
                {fileData.path}
              </Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.contentContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text variant="bodyLarge" style={styles.loadingText}>
                  Loading file...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text variant="titleMedium" style={styles.errorTitle}>
                  ❌ Error Loading File
                </Text>
                <Text variant="bodyMedium" style={styles.errorMessage}>
                  {error}
                </Text>
                <Text variant="bodySmall" style={styles.errorFile}>
                  File: {filePath}
                </Text>
              </View>
            )}

            {fileData && !loading && !error && (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.fileContent}>{fileData.content}</Text>
              </ScrollView>
            )}
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    flex: 1,
    maxHeight: '95%',
  },
  surface: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingRight: 8,
    backgroundColor: '#667eea',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoBar: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoText: {
    color: '#666',
    fontFamily: 'monospace',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    margin: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorTitle: {
    color: '#c62828',
    fontWeight: '600',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#b71c1c',
    marginBottom: 8,
  },
  errorFile: {
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fileContent: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
