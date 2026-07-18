import { render, screen } from '@testing-library/react';
import ClientAvatar from '@/components/shared/ClientAvatar';

describe('ClientAvatar', () => {
  it('показывает первую букву имени в верхнем регистре', () => {
    render(<ClientAvatar name="Straw" />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('приводит первую букву имени к верхнему регистру', () => {
    render(<ClientAvatar name="straw" />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('игнорирует пробелы в начале имени', () => {
    render(<ClientAvatar name="  straw" />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('показывает "?" для пустого имени', () => {
    render(<ClientAvatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('рендерится без падения с дефолтным размером', () => {
    render(<ClientAvatar name="Test" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
