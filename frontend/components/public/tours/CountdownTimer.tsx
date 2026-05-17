'use client';

import { useEffect, useState } from 'react';

type Props = {
    saleDeadline?: string;
};

const getTimeLeft = (saleDeadline?: string) => {
    if (!saleDeadline) {
        return 'Дата не указана';
    }

    const deadline = new Date(saleDeadline).getTime();

    if (Number.isNaN(deadline)) {
        return 'Дата не указана';
    }

    const difference = deadline - Date.now();

    if (difference <= 0) {
        return 'Акция завершена';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
};

const CountdownTimer = ({ saleDeadline }: Props) => {
    const [timeLeft, setTimeLeft] = useState('Загрузка...');

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setTimeLeft(getTimeLeft(saleDeadline));
        }, 0);

        return () => window.clearTimeout(timer);
    }, [saleDeadline]);

    useEffect(() => {
        const deadline = saleDeadline ? new Date(saleDeadline).getTime() : NaN;

        if (Number.isNaN(deadline) || deadline <= Date.now()) {
            return;
        }

        const interval = window.setInterval(() => {
            setTimeLeft(getTimeLeft(saleDeadline));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [saleDeadline]);

    return <span>{timeLeft}</span>;
};

export default CountdownTimer;