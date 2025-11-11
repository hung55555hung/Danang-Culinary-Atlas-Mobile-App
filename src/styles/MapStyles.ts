import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Thanh tìm kiếm kiểu Google Maps
  searchBarContainer: {
    position: 'absolute',
    top: 45,
    left: 15,
    right: 15,
    zIndex: 10,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  mapIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 8,
    paddingVertical: 20,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 6,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  callout: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    width: 250,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  address: {
    fontSize: 12,
    color: '#555',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default styles;
