interface LoaderProps {
  src: string;
  width?: number;
  quality?: number;
}

export default function supabaseLoader({ src }: LoaderProps) {
  return `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/defaults/${src}`;
}
