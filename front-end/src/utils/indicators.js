// Indicateurs techniques usuels, calculés côté client à partir de l'historique OHLC fourni par le back-end (proxy CoinGecko).
// Chaque fonction retourne un tableau de la même longueur que l'entrée, avec `null` tant que la fenêtre glissante n'est pas complète.

export function sma(values, period) {
    const result = new Array(values.length).fill(null);
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        if (i >= period) sum -= values[i - period];
        if (i >= period - 1) result[i] = sum / period;
    }
    return result;
}

export function ema(values, period) {
    const result = new Array(values.length).fill(null);
    const k = 2 / (period + 1);
    let prevEma = null;
    for (let i = 0; i < values.length; i++) {
        if (i === period - 1) {
            const seed = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
            prevEma = seed;
            result[i] = prevEma;
        } else if (i >= period) {
            prevEma = values[i] * k + prevEma * (1 - k);
            result[i] = prevEma;
        }
    }
    return result;
}

export function rsi(closes, period = 14) {
    const result = new Array(closes.length).fill(null);
    if (closes.length <= period) return result;

    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= period; i++) {
        const change = closes[i] - closes[i - 1];
        if (change >= 0) avgGain += change;
        else avgLoss -= change;
    }
    avgGain /= period;
    avgLoss /= period;
    result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    for (let i = period + 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return result;
}

export function macd(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = ema(closes, fastPeriod);
    const emaSlow = ema(closes, slowPeriod);

    const macdLine = closes.map((_, i) =>
        emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null,
    );

    // La ligne de signal est une EMA de la ligne MACD, calculée uniquement sur sa partie définie
    const firstValidIndex = macdLine.findIndex((v) => v != null);
    const signalLine = new Array(closes.length).fill(null);
    if (firstValidIndex !== -1) {
        const macdValues = macdLine.slice(firstValidIndex);
        const emaOfMacd = ema(macdValues, signalPeriod);
        emaOfMacd.forEach((v, idx) => {
            signalLine[firstValidIndex + idx] = v;
        });
    }

    const histogram = closes.map((_, i) =>
        macdLine[i] != null && signalLine[i] != null ? macdLine[i] - signalLine[i] : null,
    );

    return { macdLine, signalLine, histogram };
}

// ADX (Average Directional Index) + DI/-DI, lissage de Wilder — nécessite High/Low/Close (d'où l'usage de l'endpoint OHLC).
export function adx(candles, period = 14) {
    const n = candles.length;
    const plusDI = new Array(n).fill(null);
    const minusDI = new Array(n).fill(null);
    const adxLine = new Array(n).fill(null);
    if (n <= period * 2) return { adx: adxLine, plusDI, minusDI };

    const tr = new Array(n).fill(0);
    const plusDM = new Array(n).fill(0);
    const minusDM = new Array(n).fill(0);

    for (let i = 1; i < n; i++) {
        const highDiff = candles[i].high - candles[i - 1].high;
        const lowDiff = candles[i - 1].low - candles[i].low;
        plusDM[i] = highDiff > lowDiff && highDiff > 0 ? highDiff : 0;
        minusDM[i] = lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0;
        tr[i] = Math.max(
            candles[i].high - candles[i].low,
            Math.abs(candles[i].high - candles[i - 1].close),
            Math.abs(candles[i].low - candles[i - 1].close),
        );
    }

    // Premiers lissages de Wilder = simple somme des `period` premières valeurs
    let smoothTR = tr.slice(1, period + 1).reduce((a, b) => a + b, 0);
    let smoothPlusDM = plusDM.slice(1, period + 1).reduce((a, b) => a + b, 0);
    let smoothMinusDM = minusDM.slice(1, period + 1).reduce((a, b) => a + b, 0);

    const dx = new Array(n).fill(null);
    const setDI = (i) => {
        plusDI[i] = smoothTR === 0 ? 0 : (100 * smoothPlusDM) / smoothTR;
        minusDI[i] = smoothTR === 0 ? 0 : (100 * smoothMinusDM) / smoothTR;
        const diSum = plusDI[i] + minusDI[i];
        dx[i] = diSum === 0 ? 0 : (100 * Math.abs(plusDI[i] - minusDI[i])) / diSum;
    };
    setDI(period);

    for (let i = period + 1; i < n; i++) {
        smoothTR = smoothTR - smoothTR / period + tr[i];
        smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
        smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];
        setDI(i);
    }

    // ADX = moyenne de Wilder du DX, initialisée par une SMA simple des `period` premiers DX disponibles
    const firstDxIndex = period;
    const lastSeedIndex = firstDxIndex + period - 1;
    if (lastSeedIndex >= n) return { adx: adxLine, plusDI, minusDI };

    let adxValue = dx.slice(firstDxIndex, lastSeedIndex + 1).reduce((a, b) => a + b, 0) / period;
    adxLine[lastSeedIndex] = adxValue;
    for (let i = lastSeedIndex + 1; i < n; i++) {
        adxValue = (adxValue * (period - 1) + dx[i]) / period;
        adxLine[i] = adxValue;
    }

    return { adx: adxLine, plusDI, minusDI };
}
