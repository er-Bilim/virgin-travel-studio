'use client';

import { useEffect, useState } from 'react';

type Props = {
    saleDeadline: string;
};

const getTimeLeft = (saleDeadline: string) => {
    const difference = new Date(saleDeadline).getTime() - new Date().getTime();

    if (difference <= 0) {
        return 'Акция завершена';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days} дн. ${hours} ч. ${minutes} мин. ${seconds} сек.`;
};

const CountdownTimer = ({ saleDeadline }: Props) => {
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(saleDeadline));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(saleDeadline));
        }, 1000);

        return () => clearInterval(timer);
    }, [saleDeadline]);

    return (
        <span className="text-sm font-semibold text-yellow-300">
      {timeLeft}
    </span>
    );
};

export default CountdownTimer;