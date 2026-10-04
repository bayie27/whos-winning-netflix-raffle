// Three short mechanical clicks, cached once instead of synthesizing a graph
// for every card. Their small tonal differences keep a fast spin from buzzing.
export function createRouletteTicks(context: BaseAudioContext): AudioBuffer[] {
  const duration = 0.038;
  return [0.94, 1, 1.06].map((tuning) => {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    let lowNoise = 0;
    let filteredNoise = 0;
    const lowCoefficient = 1 - Math.exp(-2 * Math.PI * 900 / context.sampleRate);
    const highCoefficient = 1 - Math.exp(-2 * Math.PI * 6500 / context.sampleRate);

    for (let i = 0; i < samples.length; i++) {
      const time = i / context.sampleRate;
      const noise = Math.random() * 2 - 1;
      lowNoise += lowCoefficient * (noise - lowNoise);
      filteredNoise += highCoefficient * (noise - lowNoise - filteredNoise);

      const attack = Math.min(time / 0.0008, 1);
      const release = Math.min((duration - time) / 0.006, 1);
      const body = Math.sin(2 * Math.PI * 680 * tuning * time) * Math.exp(-time / 0.009);
      const metal = Math.sin(2 * Math.PI * 2300 * tuning * time) * Math.exp(-time / 0.004);
      const snap = filteredNoise * Math.exp(-time / 0.003);
      samples[i] = (body * 0.32 + metal * 0.16 + snap * 0.18) * attack * release;
    }

    return buffer;
  });
}
