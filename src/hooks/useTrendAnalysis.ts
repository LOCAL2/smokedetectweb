import { useMemo } from 'react';
import type { SensorHistory } from '../types/sensor';

export interface TrendInsight {
    trend: 'rising' | 'falling' | 'stable';
    trendValue: number; // percentage change
    peakTime: string | null;
    lowestTime: string | null;
    averageValue: number;
    prediction: string;
}

export const useTrendAnalysis = (history: SensorHistory[]): TrendInsight => {
    return useMemo(() => {
        if (!history || history.length < 2) {
            return {
                trend: 'stable',
                trendValue: 0,
                peakTime: null,
                lowestTime: null,
                averageValue: 0,
                prediction: 'ไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์',
            };
        }

        // Sort by timestamp just in case
        const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // 1. Calculate Trend (Compare last 10% vs first 10% of the visible window, or split half)
        // Better: Split into two halves
        const midPoint = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, midPoint);
        const secondHalf = sorted.slice(midPoint);

        const avgFirst = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;

        const diff = avgSecond - avgFirst;
        const percentChange = avgFirst !== 0 ? (diff / avgFirst) * 100 : 0;

        let trend: 'rising' | 'falling' | 'stable' = 'stable';
        if (percentChange > 5) trend = 'rising';
        else if (percentChange < -5) trend = 'falling';

        // 2. Find Peak and Lowest times
        let maxVal = -Infinity;
        let minVal = Infinity;
        let peakTimestamp = '';
        let lowestTimestamp = '';

        sorted.forEach(item => {
            if (item.value > maxVal) {
                maxVal = item.value;
                peakTimestamp = item.timestamp;
            }
            if (item.value < minVal) {
                minVal = item.value;
                lowestTimestamp = item.timestamp;
            }
        });

        const averageValue = sorted.reduce((sum, item) => sum + item.value, 0) / sorted.length;

        // 3. Generate Prediction / Insight
        let prediction = '';
        if (trend === 'rising') {
            prediction = 'แนวโน้มค่าควันกำลังสูงขึ้น ควรเฝ้าระวัง';
        } else if (trend === 'falling') {
            prediction = 'สถานการณ์กำลังดีขึ้น ค่าควันมีแนวโน้มลดลง';
        } else {
            prediction = 'ค่าควันค่อนข้างคงที่ อยู่ในระดับปกติ';
        }

        if (maxVal > 100) { // Arbitrary high threshold
            prediction += ' | พบช่วงที่มีค่าสูงผิดปกติ';
        }

        return {
            trend,
            trendValue: Math.abs(percentChange),
            peakTime: peakTimestamp ? new Date(peakTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null,
            lowestTime: lowestTimestamp ? new Date(lowestTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null,
            averageValue,
            prediction
        };
    }, [history]);
};
