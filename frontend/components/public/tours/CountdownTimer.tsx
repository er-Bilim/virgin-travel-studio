'use client';

import { useEffect, useState } from 'react';

type Props = {
    saleDeadline?: string;
};

const CountdownTimer = ({ saleDeadline }: Props) => {
    const calculateTimeLeft = () => {
        if (!saleDeadline) {
            return 'Дата не указана';
        }

        const deadline = new Date(saleDeadline).getTime();

        if (isNaN(deadline)) {
            return 'Дата не указана';
        }

        const difference = deadline - new Date().getTime();

        if (difference <= 0) {
            return 'Акция завершена';
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
            (difference / (1000 * 60 * 60)) % 24,
        );

        const minutes = Math.floor(
            (difference / (1000 * 60)) % 60,
        );

        const seconds = Math.floor(
            (difference / 1000) % 60,
        );

        return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [saleDeadline]);

    return <span>{timeLeft}</span>;
};

export default CountdownTimer;