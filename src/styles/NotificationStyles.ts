import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    marginHorizontal: 10,
  },

  backArrow: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemUnread: {},
  itemRead: {
    opacity: 0.9,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 60,
  },
  swipeContainer: {
    marginBottom: 8,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
  },
  deleteIcon: {
    fontSize: 22,
    color: '#fff',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    display: 'none',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreIndicator: {
    marginVertical: 10,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
});
