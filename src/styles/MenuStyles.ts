import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6fc2c7',
  },
  profileSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  email: {
    fontSize: 13,
    color: '#777',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
});
