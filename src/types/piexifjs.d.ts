declare module 'piexifjs' {
  export const ImageIFD: {
    Software: number;
  };
  export const ExifIFD: {
    UserComment: number;
  };
  export function dump(obj: Record<string, Record<number, string | number>>): string;
  export function insert(exif: string, image: string): string;
  const piexif: {
    ImageIFD: typeof ImageIFD;
    ExifIFD: typeof ExifIFD;
    dump: typeof dump;
    insert: typeof insert;
  };
  export default piexif;
}
