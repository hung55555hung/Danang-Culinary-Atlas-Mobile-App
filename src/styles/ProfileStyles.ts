import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginLeft: 5,
    flex: 1,
    textAlign: 'center',
  },
  backArrow: {
    width: 25,
    height: 25,
    tintColor: '#1F1F1F',
  },
  headerBackground: {
    backgroundColor: '#0A4C63',
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatarContainer: {
    alignItems: 'center',
    marginTop: -70,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: '38%',
    backgroundColor: '#4BA3A3',
    borderRadius: 20,
    padding: 8,
  },

  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 5,
    color: '#555',
  },

  section: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginVertical: 10,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FAF9F9',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F9',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  dateText: {
    color: '#333',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#0A4C63',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
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
  updateButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
