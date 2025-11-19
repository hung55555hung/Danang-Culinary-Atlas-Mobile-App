import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    marginHorizontal: -16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  backArrow: {
    width: 30,
    height: 25,
    tintColor: '#fff',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  shopList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  shopItem: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    position: 'relative',
    minHeight: 60,
    paddingTop: 36,
  },
  shopName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6, // Thêm khoảng cách dưới tên
  },
  shopContentRow: {
    flexDirection: 'row',
  },
  shopIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  shopAddress: {
    fontSize: 13,
    color: '#666',
    flexShrink: 1,
  },
  addButton: {
    backgroundColor: '#0C516F',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
