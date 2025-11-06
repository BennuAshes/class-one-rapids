/**
 * File Changes Viewer Component
 * Displays file tree and changes for approval items
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Chip, Text, Card, IconButton } from 'react-native-paper';
import type { FileTreeNode, ChangedFile } from '../api/types';

interface FileChangesViewerProps {
  fileTree?: FileTreeNode[];
  changedFiles?: ChangedFile[];
  gitDiff?: string;
}

export function FileChangesViewer({
  fileTree,
  changedFiles,
  gitDiff
}: FileChangesViewerProps) {
  const [showDiff, setShowDiff] = useState(false);

  if (!changedFiles || changedFiles.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            📁 File Changes
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {changedFiles.length} file{changedFiles.length !== 1 ? 's' : ''} will be affected
          </Text>
        </View>

        <ScrollView style={styles.treeContainer}>
          {fileTree && fileTree.map((node, idx) => (
            <FileTreeNodeComponent key={idx} node={node} depth={0} />
          ))}
        </ScrollView>

        {gitDiff && (
          <View style={styles.diffSection}>
            <View style={styles.diffHeader}>
              <Text variant="titleSmall">Git Diff</Text>
              <IconButton
                icon={showDiff ? 'chevron-up' : 'chevron-down'}
                size={20}
                onPress={() => setShowDiff(!showDiff)}
              />
            </View>
            {showDiff && (
              <ScrollView style={styles.diffContent}>
                <Text style={styles.diffText}>{gitDiff}</Text>
              </ScrollView>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const FileTreeNodeComponent: React.FC<{
  node: FileTreeNode;
  depth: number;
}> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(true);

  const icon = node.type === 'directory'
    ? (expanded ? 'folder-open' : 'folder')
    : 'file-document';

  const statusColor = {
    created: '#4caf50',
    modified: '#ff9800',
    deleted: '#f44336',
  }[node.status || 'modified'];

  return (
    <View style={{ marginLeft: depth * 20 }}>
      <List.Item
        title={node.name}
        titleStyle={styles.fileName}
        left={(props) => (
          <List.Icon {...props} icon={icon} style={styles.fileIcon} />
        )}
        right={() =>
          node.status ? (
            <Chip
              mode="flat"
              textStyle={styles.statusChipText}
              style={[
                styles.statusChip,
                { backgroundColor: statusColor }
              ]}
            >
              {node.status}
            </Chip>
          ) : null
        }
        onPress={() => {
          if (node.children) {
            setExpanded(!expanded);
          }
        }}
        style={styles.listItem}
      />
      {expanded && node.children?.map((child, idx) => (
        <FileTreeNodeComponent
          key={idx}
          node={child}
          depth={depth + 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    color: '#495057',
  },
  subtitle: {
    color: '#6c757d',
    marginTop: 4,
  },
  treeContainer: {
    maxHeight: 250,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  listItem: {
    paddingVertical: 4,
    minHeight: 40,
  },
  fileIcon: {
    margin: 0,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  statusChip: {
    height: 22,
    marginRight: 8,
  },
  statusChipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  diffSection: {
    marginTop: 12,
  },
  diffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  diffContent: {
    maxHeight: 200,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  diffText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#212529',
  },
});