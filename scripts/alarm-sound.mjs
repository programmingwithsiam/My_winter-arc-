export function generateAlarmSound() {
  const sampleRate = 22050;
  const duration = 1.8;
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(sampleCount * 2, 40);

  for (let i = 0; i < sampleCount; i++) {
    const time = i / sampleRate;
    const pulse = time % 0.6;
    const envelope = pulse < 0.2 ? Math.min(1, pulse / 0.015, (0.2 - pulse) / 0.025) : 0;
    const frequency = pulse < 0.2 ? 880 : 660;
    const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.38;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return buffer;
}
