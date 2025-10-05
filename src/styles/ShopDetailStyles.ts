import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  ratingNumber: { fontSize: 18, fontWeight: 'bold', marginRight: 5 },
  category: { fontSize: 16, color: 'gray', marginBottom: 10 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0C516F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  reviewItem: { marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { fontWeight: 'bold', fontSize: 14 },
  time: { fontSize: 12, color: 'gray' },
  starSmall: { width: 16, height: 16, marginRight: 2 },
  reviewText: { fontSize: 14, marginVertical: 5 },
  reviewImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 30,
  },
  foodImageCarousel: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default styles;
