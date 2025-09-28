// src/declarations.d.ts
declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default class MaterialIcons extends Icon {}
}

declare module 'react-native-vector-icons/*' {
  const content: any;
  export default content;
}
