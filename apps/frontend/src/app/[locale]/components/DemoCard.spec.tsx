import { render, screen } from '@testing-library/react';
import { Upload } from 'lucide-react';
import { DemoCard } from './DemoCard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  href: '/upload',
  title: 'File Upload Demo',
  description: 'Upload large files with S3 multipart support.',
  icon: Upload,
  accent: 'bg-blue-500/10',
  iconColor: 'text-blue-500',
};

describe('DemoCard', () => {
  it('renders the title', () => {
    render(<DemoCard {...defaultProps} />);
    expect(screen.getByText('File Upload Demo')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<DemoCard {...defaultProps} />);
    expect(screen.getByText('Upload large files with S3 multipart support.')).toBeInTheDocument();
  });

  it('links to the correct href', () => {
    render(<DemoCard {...defaultProps} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/upload');
  });

  it('renders the Explore label', () => {
    render(<DemoCard {...defaultProps} />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('applies the accent class to the icon wrapper', () => {
    render(<DemoCard {...defaultProps} />);
    const link = screen.getByRole('link');
    const iconWrapper = link.querySelector('div');
    expect(iconWrapper?.className).toContain('bg-blue-500/10');
  });
});
