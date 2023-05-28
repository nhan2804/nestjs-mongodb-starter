const videoExtensions = [
  '.mpg',
  '.mp2',
  '.mpeg',
  '.mpe',
  '.mpv',
  '.mp4',
  '.mov',
  '.wmv',
  '.avi',
  '.flv',
  '.webm',
  '.mpeg',
  '.m4v',
  '.3gp',
  '.quicktime',
]; //you can add more extensions
const imageExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.bmp', '.svg']; // you can add more extensions
const videoOrImage = (ext: string) => {
  ext = ext?.toLocaleLowerCase();
  const isImage = imageExtensions?.includes(ext);
  if (isImage) return 'images';
  const isVideo = videoExtensions?.includes(ext);
  if (isVideo) return 'videos';

  return 'media';
};

export default videoOrImage;
