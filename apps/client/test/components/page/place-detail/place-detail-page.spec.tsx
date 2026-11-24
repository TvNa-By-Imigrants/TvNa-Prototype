import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaceDetailPage } from '@/components/page/place-detail';
import { LanguageProvider } from '@/i18n';
import type { Place } from '@repo/contracts';

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockPlace: Place = {
  id: 'tsutaya-bkk1',
  name: 'Tatsuya Bookstore Cafe',
  nameKm: 'ហាងសៀវភៅ និងកាហ្វេ តាតស៊ូយ៉ា',
  area: 'BKK1',
  province: 'Phnom Penh',
  category: 'Bookstore Cafe',
  categoryId: 'cafe',
  image: 'https://res.cloudinary.com/daqze8ogx/image/upload/v1/tsutaya.webp',
  photos: ['https://res.cloudinary.com/daqze8ogx/image/upload/v1/tsutaya.webp'],
  rating: 4.8,
  reviewsCount: 342,
  priceLevel: '$$',
  hours: '8:00 AM - 9:00 PM',
  is24Hours: false,
  isPartnered: true,
  address: 'Street 240, BKK1, Phnom Penh',
  description: 'Cozy atmosphere for reading and working with high-speed internet.',
  lat: 11.5564,
  lng: 104.9282,
  tags: ['books', 'coffee', 'matcha'],
};

function renderPage(props: Partial<React.ComponentProps<typeof PlaceDetailPage>> = {}) {
  const defaultProps = {
    place: mockPlace,
    onBack: vi.fn(),
  };

  return render(
    <LanguageProvider>
      <PlaceDetailPage {...defaultProps} {...props} />
    </LanguageProvider>,
  );
}

describe('PlaceDetailPage (DE Design)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tvna-language', 'en');
  });

  describe('Top Navigation Bar', () => {
    it('renders dedicated back button that invokes onBack', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();
      renderPage({ onBack });

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDefined();

      await user.click(backButton);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('renders category badge and partner badge in top navigation bar', () => {
      renderPage();

      expect(screen.getAllByText('Bookstore Cafe').length).toBeGreaterThan(0);
      expect(screen.getByText('Partner')).toBeDefined();
    });

    it('renders share button with copy feedback', async () => {
      const user = userEvent.setup();
      renderPage();

      const shareButton = screen.getByRole('button', { name: /share/i });
      expect(shareButton).toBeDefined();

      await user.click(shareButton);
      expect(await screen.findByText('Link copied to clipboard!')).toBeDefined();
    });
  });

  describe('Interactive Multi-Photo Gallery', () => {
    const multiPhotos = [
      'https://res.cloudinary.com/daqze8ogx/image/upload/v1/photo1.webp',
      'https://res.cloudinary.com/daqze8ogx/image/upload/v1/photo2.webp',
      'https://res.cloudinary.com/daqze8ogx/image/upload/v1/photo3.webp',
    ];

    it('renders single photo when custom photos are not provided', () => {
      renderPage();

      const image = screen.getByAltText('Tatsuya Bookstore Cafe - photo 1');
      expect(image).toBeDefined();
      expect(image.getAttribute('src')).toBe(mockPlace.image);
    });

    it('supports multiple photos with chevron controls and thumbnail strip', async () => {
      const user = userEvent.setup();
      renderPage({ photos: multiPhotos });

      // Starts on first photo
      const image1 = screen.getByAltText('Tatsuya Bookstore Cafe - photo 1');
      expect(image1.getAttribute('src')).toBe(multiPhotos[0]);
      expect(screen.getByText('1 of 3')).toBeDefined();

      // Click next photo button
      const nextBtn = screen.getByLabelText('Next photo');
      await user.click(nextBtn);

      // Now on second photo
      const image2 = screen.getByAltText('Tatsuya Bookstore Cafe - photo 2');
      expect(image2.getAttribute('src')).toBe(multiPhotos[1]);
      expect(screen.getByText('2 of 3')).toBeDefined();

      // Click previous photo button
      const prevBtn = screen.getByLabelText('Previous photo');
      await user.click(prevBtn);

      // Back to first photo
      const imageBack = screen.getByAltText('Tatsuya Bookstore Cafe - photo 1');
      expect(imageBack.getAttribute('src')).toBe(multiPhotos[0]);

      // Click 3rd thumbnail directly
      const thumb3 = screen.getByLabelText('Select photo 3');
      await user.click(thumb3);

      const image3 = screen.getByAltText('Tatsuya Bookstore Cafe - photo 3');
      expect(image3.getAttribute('src')).toBe(multiPhotos[2]);
    });
  });

  describe('Place Attributes & Venue Details', () => {
    it('correctly renders place name, Khmer name, and description', () => {
      renderPage();

      expect(screen.getAllByText('Tatsuya Bookstore Cafe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ហាងសៀវភៅ និងកាហ្វេ តាតស៊ូយ៉ា').length).toBeGreaterThan(0);
      expect(
        screen.getByText(
          'Cozy atmosphere for reading and working with high-speed internet.',
        ),
      ).toBeDefined();
    });

    it('correctly renders price level and operating hours', () => {
      renderPage();

      expect(screen.getByText('Moderate ($$)')).toBeDefined();
      expect(screen.getByText('8:00 AM - 9:00 PM')).toBeDefined();
    });

    it('correctly renders location text and GPS coordinates', () => {
      renderPage();

      expect(screen.getAllByText(/BKK1, Phnom Penh/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Street 240, BKK1, Phnom Penh')).toBeDefined();
      expect(screen.getByText(/11.5564, 104.9282/)).toBeDefined();
    });

    it('correctly renders tags', () => {
      renderPage();

      expect(screen.getByText('#books')).toBeDefined();
      expect(screen.getByText('#coffee')).toBeDefined();
      expect(screen.getByText('#matcha')).toBeDefined();
    });
  });

  describe('Interactive 5-Star Rating Widget', () => {
    it('allows user to click a star and displays instant thank-you feedback', async () => {
      const user = userEvent.setup();
      renderPage();

      expect(screen.getByText('Rate this place')).toBeDefined();

      // Click the 5th star
      const star5 = screen.getByRole('button', { name: /rate 5 stars/i });
      await user.click(star5);

      // Verify instant feedback with rating
      expect(
        screen.getByText('Thank you for your rating! (5/5)'),
      ).toBeDefined();
    });
  });

  describe('Action Triggers ("View on Map" and "Add to Plan")', () => {
    it('triggers "View on Map" and navigates to /map', async () => {
      const user = userEvent.setup();
      const onViewOnMap = vi.fn();
      renderPage({ onViewOnMap });

      // There are both desktop and mobile CTA buttons
      const mapButtons = screen.getAllByRole('button', { name: /view on map/i });
      expect(mapButtons.length).toBeGreaterThan(0);

      await user.click(mapButtons[0]!);
      expect(onViewOnMap).toHaveBeenCalledWith(mockPlace);
    });

    it('triggers "Add to Plan" with visual checkmark confirmation', async () => {
      const user = userEvent.setup();
      const onAddToPlan = vi.fn();
      renderPage({ onAddToPlan });

      const planButtons = screen.getAllByRole('button', { name: /add to plan/i });
      expect(planButtons.length).toBeGreaterThan(0);

      await user.click(planButtons[0]!);
      expect(onAddToPlan).toHaveBeenCalledWith(mockPlace);

      // Verify confirmed visual feedback
      expect(screen.getAllByText('Added to Plan').length).toBeGreaterThan(0);
    });
  });
});
