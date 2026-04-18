import { BsFilePdf, BsFileWord, BsFileImage, BsFileText, BsFile } from 'react-icons/bs';

const config = {
  pdf:  { Icon: BsFilePdf,   color: '#dc2626' },
  docx: { Icon: BsFileWord,  color: '#2563eb' },
  doc:  { Icon: BsFileWord,  color: '#2563eb' },
  txt:  { Icon: BsFileText,  color: '#6b7280' },
  jpg:  { Icon: BsFileImage, color: '#7c3aed' },
  jpeg: { Icon: BsFileImage, color: '#7c3aed' },
  png:  { Icon: BsFileImage, color: '#7c3aed' },
};

function FileIcon({ filename, size = 28 }) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const { Icon, color } = config[ext] || { Icon: BsFile, color: '#9ca3af' };
  return <Icon size={size} color={color} style={{ flexShrink: 0 }} />;
}

export default FileIcon;
