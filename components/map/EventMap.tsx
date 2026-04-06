"use client";

type Props = {
  latitude: number;
  longitude: number;
};

export default function EventMap({ latitude, longitude }: Props) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        className="border-0 w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
      />
    </div>
  );
}
