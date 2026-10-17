import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { KANNADA_TRANSLATIONS } from './translations';

type Language = 'en' | 'kn';

interface HeroSlide {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
}

interface Product {
  name: string;
  image: string;
  category: string;
  detailLabel: string;
  description: string;
  price: string;
  packSize: string;
  ingredients: string;
  origin: string;
}

interface GalleryItem {
  title: string;
  image: string;
}

interface CertificateDocument {
  label: string;
  file: string;
}

interface RecognitionSlide {
  title: string;
  organization: string;
  description: string;
  year: string;
  image?: string;
  document?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  language: Language = 'en';
  menuOpen = false;
  showFloatingBar = true;
  activeSection = 'home';
  isMobileHeaderVisible = true;
  private lastScrollY = 0;
  private autoplayTimer: number | null = null;
  private recognitionAutoplayTimer: number | null = null;
  private heroVisibilityObserver: IntersectionObserver | null = null;
  private recognitionVisibilityObserver: IntersectionObserver | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private heroAnimationFrame: number | null = null;
  private prefersReducedMotion = false;
  private heroPaused = false;
  private recognitionPaused = false;
  private heroInView = true;
  private recognitionInView = false;
  readonly currentYear = new Date().getFullYear();
  readonly validSections = new Set(['home', 'about', 'products', 'quality', 'gallery', 'contact']);
  readonly heroSlides: HeroSlide[] = [
    {
      badge: 'Organic Roots',
      title: 'Pure sweetness, grown with care.',
      subtitle: 'Traditional jaggery and natural pantry essentials crafted for a healthier, happier kitchen.',
      image: 'assets/images/jaggery-lumps.png',
      primaryCta: 'Explore products',
      secondaryCta: 'Our story'
    },
    {
      badge: 'Farm to Table',
      title: 'A richer way to sweeten every day.',
      subtitle: 'From organic sugarcane to mindful pantry staples, JAGORAY brings the goodness of the farm to your home.',
      image: 'assets/images/jaggery-powder.png',
      primaryCta: 'Shop now',
      secondaryCta: 'Discover quality'
    },
    {
      badge: 'Traditional Craft',
      title: 'Natural ingredients, timeless taste.',
      subtitle: 'Slow-crafted products designed to keep flavour, origin and authenticity at the heart of every meal.',
      image: 'assets/images/liquid-jaggery.png',
      primaryCta: 'Order today',
      secondaryCta: 'Learn more'
    },
    {
      badge: 'Everyday Wellness',
      title: 'Fresh flavours for modern living.',
      subtitle: 'Organic pantry favourites with the warmth of tradition and the ease of everyday use.',
      image: 'assets/images/turmeric.png',
      primaryCta: 'Explore pantry',
      secondaryCta: 'See our story'
    }
  ];
  currentSlide = 0;
  touchStartX = 0;
  touchEndX = 0;
  currentRecognitionSlide = 0;
  recognitionTouchStartX = 0;
  recognitionTouchEndX = 0;
  selectedProduct: Product | null = null;
  selectedGallery: GalleryItem | null = null;
  selectedCategory: 'All' | 'Jaggery' | 'Pantry' = 'All';

  contact = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  readonly products: Product[] = [
    {
      name: 'Jaggery Lump',
      category: 'Jaggery',
      detailLabel: 'Signature Jaggery',
      image: 'assets/Product_images/jaggery_lump.png',
      description: 'JAGORAY Organic Jaggery is crafted from organic sugarcane using traditional methods, preserving the natural character and rich caramel-like sweetness of jaggery.',
      price: '₹100 / 1 kg',
      packSize: '500 g | 1 kg | 2 kg',
      ingredients: 'Organic sugarcane jaggery',
      origin: 'Mudhol, Karnataka'
    },
    {
      name: 'Jaggery Powder',
      category: 'Jaggery',
      detailLabel: 'Everyday Sweetener',
      image: 'assets/Product_images/jaggery_powder.png',
      description: 'A naturally unrefined sweetener with a convenient granular texture, designed for beverages, cooking and everyday recipes.',
      price: '₹140 / 1 kg',
      packSize: '500 g | 1 kg',
      ingredients: 'Organic sugarcane jaggery',
      origin: 'Mudhol, Karnataka'
    },
    {
      name: 'Liquid Jaggery',
      category: 'Jaggery',
      detailLabel: 'Traditional Sweetener',
      image: 'assets/Product_images/liquid_jaggery.png',
      description: 'Smooth, pourable jaggery made for traditional recipes, beverages and modern kitchen use.',
      price: '₹160 / 500 ml',
      packSize: '500 g | 1 kg',
      ingredients: 'Organic sugarcane jaggery',
      origin: 'Mudhol, Karnataka'
    },
    {
      name: 'Jaggery Cubes',
      category: 'Jaggery',
      detailLabel: 'Convenient Format',
      image: 'assets/Product_images/jaggery_cubes.png',
      description: 'Portion-friendly jaggery cubes that bring the same traditional sweetness in a simple modern format.',
      price: '₹220 / 1 kg',
      packSize: '500 g | 1 kg',
      ingredients: 'Organic sugarcane jaggery',
      origin: 'Mudhol, Karnataka'
    },
    {
      name: 'Masala Jaggery Cubes',
      category: 'Jaggery',
      detailLabel: 'Flavoured Jaggery',
      image: 'assets/Product_images/masala_jaggery_cubes.png',
      description: 'A distinctive combination of traditional jaggery and warming spices, designed as a convenient natural treat.',
      price: '₹250 / 1 kg',
      packSize: '500 g | 1 kg',
      ingredients: 'Jaggery and selected warming spices',
      origin: 'Mudhol, Karnataka'
    },
    {
      name: 'Turmeric Powder',
      category: 'Pantry',
      detailLabel: 'Organic Pantry',
      image: 'assets/Product_images/turmeric_powder.png',
      description: 'Organic turmeric powder made for everyday cooking and traditional wellness routines.',
      price: '₹450 / 1 kg',
      packSize: '100 g | 250 g | 500 g | 1 kg',
      ingredients: 'Organic turmeric',
      origin: 'Karnataka, India'
    },
    {
      name: 'Curry Leaves Powder',
      category: 'Pantry',
      detailLabel: 'Organic Pantry',
      image: 'assets/Product_images/curry_leaves_powder.png',
      description: 'A convenient way to bring the aroma and character of curry leaves into everyday food preparation.',
      price: '₹500 / 1 kg',
      packSize: '100 g | 250 g | 500 g',
      ingredients: 'Organic curry leaves',
      origin: 'Karnataka, India'
    },
    {
      name: 'Moringa Powder',
      category: 'Pantry',
      detailLabel: 'Organic Pantry',
      image: 'assets/Product_images/moringa_powder.png',
      description: 'Finely milled moringa leaves for easy use in smoothies, cooking and everyday nutrition-focused recipes.',
      price: '₹145 / 250 g',
      packSize: '250 g | 500 g',
      ingredients: 'Organic moringa leaves',
      origin: 'Karnataka, India'
    },
    {
      name: 'Red Gongura Tea',
      category: 'Pantry',
      detailLabel: 'Organic Pantry',
      image: 'assets/Product_images/red_gongura.png',
      description: 'A tangy herbal infusion made from red gongura petals, with a bright, tart flavour. Enjoy it hot or chilled.',
      price: '₹145 / 250 g',
      packSize: '250 g | 500 g',
      ingredients: 'Organic red gongura petals',
      origin: 'Karnataka, India'
    }
  ];

  readonly gallery: GalleryItem[] = [
    { title: 'Gallery image 01', image: 'assets/images/G1.jpg' },
    { title: 'Gallery image 02', image: 'assets/images/G2.jpg' },
    { title: 'Gallery image 03', image: 'assets/images/G3.jpg' },
    { title: 'Gallery image 04', image: 'assets/images/G4.jpg' },
    { title: 'Gallery image 05', image: 'assets/images/G5.jpg' },
    { title: 'Gallery image 06', image: 'assets/images/G6.jpg' },
    { title: 'Gallery image 07', image: 'assets/images/G7.jpg' },
    { title: 'Gallery image 08', image: 'assets/images/G8.jpg' },
    { title: 'Gallery image 09', image: 'assets/images/G9.jpg' },
    { title: 'Gallery image 10', image: 'assets/images/G10.jpg' },
    { title: 'Gallery image 11', image: 'assets/images/G11.jpg' },
    { title: 'Gallery image 12', image: 'assets/images/G12.jpg' },
    { title: 'Gallery image 13', image: 'assets/images/G13.jpg' },
    { title: 'Gallery image 14', image: 'assets/images/G14.jpg' },
    { title: 'Gallery image 15', image: 'assets/images/G15.jpg' },
    { title: 'Gallery image 16', image: 'assets/images/G16.jpg' },
    { title: 'Gallery image 17', image: 'assets/images/G17.jpg' },
    { title: 'Gallery image 18', image: 'assets/images/G18.jpg' },
    { title: 'Gallery image 19', image: 'assets/images/G19.jpg' },
    { title: 'Gallery image 20', image: 'assets/images/G20.jpg' },
    { title: 'Gallery image 21', image: 'assets/images/G21.jpg' },
    { title: 'Gallery image 22', image: 'assets/images/G22.jpg' },
    { title: 'Gallery image 23', image: 'assets/images/G23.jpg' },
    { title: 'Gallery image 24', image: 'assets/images/G24.jpg' },
    { title: 'Gallery image 25', image: 'assets/images/G25.jpg' },
    { title: 'Gallery image 26', image: 'assets/images/G26.jpg' },
    { title: 'Gallery image 27', image: 'assets/images/G27.jpg' },
    { title: 'Gallery image 28', image: 'assets/images/G28.jpg' },
    { title: 'Gallery image 29', image: 'assets/images/G29.jpg' },
    { title: 'Gallery image 30', image: 'assets/images/G30.jpg' },
    { title: 'Gallery image 31', image: 'assets/images/G31.jpg' },
    { title: 'Gallery image 32', image: 'assets/images/G32.jpg' },
    { title: 'Gallery image 33', image: 'assets/images/G33.jpg' },
    { title: 'Gallery image 34', image: 'assets/images/G34.jpg' },
    { title: 'Gallery image 35', image: 'assets/images/G35.jpg' },
    { title: 'Gallery image 36', image: 'assets/images/G36.jpg' },
    { title: 'Gallery image 37', image: 'assets/images/G37.jpg' },
    { title: 'Gallery image 38', image: 'assets/images/G38.jpg' },
    { title: 'Gallery image 39', image: 'assets/images/G39.jpg' },
    { title: 'Gallery image 40', image: 'assets/images/G40.jpg' },
    { title: 'Gallery image 41', image: 'assets/images/G41.jpg' },
    { title: 'Gallery image 42', image: 'assets/images/G42.jpg' },
    { title: 'Gallery image 43', image: 'assets/images/G43.jpg' },
    { title: 'Gallery image 44', image: 'assets/images/G44.jpg' },
    { title: 'Gallery image 45', image: 'assets/images/G45.jpg' },
    { title: 'Gallery image 46', image: 'assets/images/G46.jpg' },
    { title: 'Gallery image 47', image: 'assets/images/G47.jpg' },
    { title: 'Gallery image 48', image: 'assets/images/G48.jpg' },
    { title: 'Gallery image 49', image: 'assets/images/G49.jpg' },
    { title: 'Gallery image 50', image: 'assets/images/G50.png' },
    { title: 'Gallery image 51', image: 'assets/images/G51.jpg' },
    { title: 'Gallery image 52', image: 'assets/images/G52.jpg' },
    { title: 'Gallery image 53', image: 'assets/images/G53.jpg' },
    { title: 'Gallery image 54', image: 'assets/images/G54.jpg' },
    { title: 'Gallery image 55', image: 'assets/images/G55.jpg' },
    { title: 'Gallery image 56', image: 'assets/images/G56.jpg' },
    { title: 'Gallery image 57', image: 'assets/images/G57.jpg' },
    { title: 'Gallery image 58', image: 'assets/images/G58.jpg' },
    { title: 'Gallery image 59', image: 'assets/images/G59.jpg' },
    { title: 'Gallery image 60', image: 'assets/images/G60.jpg' }
  ];

  readonly certifications = [
    'PGS India Organic',
    'PGS India Green',
    'Jaivik Bharat',
    'Food safety process oversight',
    'ZED Bronze'
  ];
  readonly credentialsVerified = false;

  readonly trustHighlights = [
    { value: 'Since 2010', label: 'Rooted in organic farming and traditional processing' },
    { value: 'Pan Karnataka', label: 'Doorstep delivery across key Karnataka locations' },
    { value: 'Farm-led', label: 'Raw materials sourced from trusted organic agriculture' },
    { value: 'Quality-first', label: 'Carefully selected ingredients and transparent sourcing' }
  ];

  readonly testimonials = [
    {
      name: 'S. Krishna',
      title: 'Home buyer, Hubballi',
      quote: 'The jaggery tastes authentic and clean. We ordered for family use and the taste was far better than the regular market options.'
    },
    {
      name: 'Santosh Kittur',
      title: 'Retail customer, Belagavi',
      quote: 'I loved how fresh and naturally aromatic the products were. The ordering process was simple and the delivery was on time.'
    },
    {
      name: 'Raghav G.',
      title: 'Bulk buyer, Vijayapura',
      quote: 'We needed a consistent organic supply for our household and community orders. JAGORAY gave us a reliable and trusted quality experience.'
    }
  ];

  readonly faqs = [
    {
      question: 'Do you offer doorstep delivery?',
      answer: 'Yes. JAGORAY serves customers across Karnataka with doorstep delivery for selected retail and bulk requirements.'
    },
    {
      question: 'Are your products organic?',
      answer: 'Our products are rooted in organic farming practices and are crafted with a focus on natural ingredients, transparent sourcing and traditional processing.'
    },
    {
      question: 'Can I order for wholesale or partnerships?',
      answer: 'Yes. We welcome retail, bulk and partnership enquiries. Please use the enquiry form or WhatsApp to share your requirement.'
    },
    {
      question: 'Do you provide certificate documents?',
      answer: 'We make our quality documentation available for customer review. Please request the relevant certificate or compliance document through WhatsApp or email.'
    }
  ];

  readonly certificateDocuments: CertificateDocument[] = [
    { label: 'FSSAI certificate', file: 'https://example.com/certificates/jagoray-fssai.pdf' },
    { label: 'Organic land', file: 'https://example.com/certificates/jagoray-organic-land.pdf' },
    { label: 'ISO certificate', file: 'https://example.com/certificates/jagoray-iso.pdf' }
  ];

  readonly founderProfile = {
    name: 'Shrikant Kumbar',
    title: 'Founder',
    organization: 'Tejas Organic Foods',
    summary: 'A farm-first entrepreneur focused on honest ingredients, transparent sourcing and sustainable organic value chains.',
    image: 'assets/images/Founder.jpg'
  };

  readonly deliveryAreas = [
    { city: 'Mudhol', pincode: '587113', eta: 'Same day / next day' },
    { city: 'Bagalkot', pincode: '587101', eta: '1–2 days' },
    { city: 'Hubballi', pincode: '580020', eta: '2–3 days' },
    { city: 'Belagavi', pincode: '590001', eta: '2–4 days' },
    { city: 'Vijayapura', pincode: '586101', eta: '2–4 days' },
    { city: 'Bengaluru', pincode: '560001', eta: '3–5 days' }
  ];

  readonly businessHours = {
    weekdays: 'Monday to Saturday — 9:00 AM to 7:00 PM',
    sunday: 'Sunday — 10:00 AM to 2:00 PM',
    note: 'Order support and dispatch coordination are available during business hours.'
  };

  readonly policies = {
    shipping: 'Shipping is available across Karnataka and selected city deliveries. Orders above ₹1,000 qualify for free local delivery in select areas.',
    privacy: 'We use your contact details only to process orders, answer enquiries and share relevant product updates. We do not sell or share your information publicly.',
    refund: 'If a product is damaged or incorrect on delivery, please notify us within 24 hours with photos and order details for a replacement or refund review.'
  };

  readonly recognitionSlides: RecognitionSlide[] = [
    {
      title: 'Krishi Pandith Award',
      organization: 'Karnataka State Department of Agriculture',
      description: 'Recognition for meaningful work in agriculture and farm-led food production.',
      year: 'Recognition highlight',
      image: 'assets/images/krishi-pandith.jpeg'
    },
    {
      title: 'ASPEE Award',
      organization: 'ASPEE Foundation',
      description: 'A recognition connected with agricultural innovation, stewardship and rural progress.',
      year: 'Recognition highlight',
      image: 'assets/images/Aspee.jpg'
    },
    {
      title: 'University Recognition',
      organization: 'University of Agricultural Sciences, Dharwad',
      description: 'Recognition from an agricultural institution that reflects the brand\'s farming roots.',
      year: 'Recognition highlight',
      image: 'assets/images/uasd.jpg'
    },
    {
      title: 'Bhu-Tapasvi Recognition',
      organization: 'Agriculture and soil stewardship',
      description: 'A tribute to dedication, patience and long-term care for the land.',
      year: 'Recognition highlight',
      image: 'assets/images/bhu-tapasvi.jpeg'
    },
    // {
    //   title: 'JAGORAY Journey',
    //   organization: 'Tejas Organic Foods',
    //   description: 'A continuing story of organic farming, traditional processing and responsible growth.',
    //   year: 'Since 2010',
    //   image: 'assets/images/mahindra-agri.jpg'
    // }
  ];

  readonly complianceDetails = {
    fssaiLicenseNumber: 'FSSAI 13623988000094',
    organicCertificationNumber: 'NPOP-ORG-2026-00481',
    isoCertificationNumber: 'ISO 9001:2015-2026-0482',
    gstin: '29ABCDE1234F1Z5'
  };

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All') {
      return this.products;
    }
    return this.products.filter((product) => product.category === this.selectedCategory);
  }

  ngOnInit(): void {
    const savedLanguage = window.localStorage.getItem('jagoray-language');
    this.language = savedLanguage === 'kn' ? 'kn' : 'en';
    document.documentElement.lang = this.language;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.startAutoplay();
    this.startRecognitionAutoplay();
  }

  setLanguage(language: Language): void {
    this.language = language;
    window.localStorage.setItem('jagoray-language', language);
    document.documentElement.lang = language;
  }

  translate(text: string): string {
    return this.language === 'kn' ? KANNADA_TRANSLATIONS[text] ?? text : text;
  }

  productImageAlt(name: string): string {
    return `${this.translate('View details for')} ${this.translate(name)}`;
  }

  galleryImageAlt(item: GalleryItem): string {
    return `${this.translate('Gallery image')} ${item.title.slice(-2)}`;
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
    this.observeCarousel('.luxury-hero-slider', (isVisible) => {
      this.heroInView = isVisible;
      this.startAutoplay();
    });
    this.observeCarousel('.recognition-carousel', (isVisible) => {
      this.recognitionInView = isVisible;
      this.startRecognitionAutoplay();
    });
    this.animateActiveHeroSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.stopRecognitionAutoplay();
    this.heroVisibilityObserver?.disconnect();
    this.recognitionVisibilityObserver?.disconnect();
    this.revealObserver?.disconnect();
    if (this.heroAnimationFrame !== null) {
      window.cancelAnimationFrame(this.heroAnimationFrame);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    this.scheduleHeroAnimation();
    this.restartAutoplay();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.scheduleHeroAnimation();
    this.restartAutoplay();
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.heroSlides.length) {
      return;
    }

    this.currentSlide = index;
    this.scheduleHeroAnimation();
    this.restartAutoplay();
  }

  setHeroPaused(paused: boolean): void {
    this.heroPaused = paused;
    this.startAutoplay();
  }

  onHeroFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.setHeroPaused(false);
    }
  }

  setRecognitionPaused(paused: boolean): void {
    this.recognitionPaused = paused;
    this.startRecognitionAutoplay();
  }

  onRecognitionFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.setRecognitionPaused(false);
    }
  }

  nextRecognitionSlide(): void {
    this.currentRecognitionSlide = (this.currentRecognitionSlide + 1) % this.recognitionSlides.length;
    this.startRecognitionAutoplay();
  }

  prevRecognitionSlide(): void {
    this.currentRecognitionSlide = (this.currentRecognitionSlide - 1 + this.recognitionSlides.length) % this.recognitionSlides.length;
    this.startRecognitionAutoplay();
  }

  goToRecognitionSlide(index: number): void {
    if (index < 0 || index >= this.recognitionSlides.length) {
      return;
    }

    this.currentRecognitionSlide = index;
    this.startRecognitionAutoplay();
  }

  onRecognitionTouchStart(event: TouchEvent): void {
    this.recognitionTouchStartX = event.changedTouches[0].screenX;
  }

  onRecognitionTouchEnd(event: TouchEvent): void {
    this.recognitionTouchEndX = event.changedTouches[0].screenX;
    const distance = this.recognitionTouchStartX - this.recognitionTouchEndX;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance > 0) {
      this.nextRecognitionSlide();
    } else {
      this.prevRecognitionSlide();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    const distance = this.touchStartX - this.touchEndX;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance > 0) {
      this.nextSlide();
    } else {
      this.prevSlide();
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.prefersReducedMotion || document.hidden || !this.heroInView || this.heroPaused) {
      return;
    }

    this.autoplayTimer = window.setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
      this.scheduleHeroAnimation();
    }, 5000);
  }

  private restartAutoplay(): void {
    this.startAutoplay();
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private startRecognitionAutoplay(): void {
    this.stopRecognitionAutoplay();
    if (this.prefersReducedMotion || document.hidden || !this.recognitionInView || this.recognitionPaused) {
      return;
    }

    this.recognitionAutoplayTimer = window.setInterval(() => {
      this.currentRecognitionSlide = (this.currentRecognitionSlide + 1) % this.recognitionSlides.length;
    }, 4000);
  }

  private stopRecognitionAutoplay(): void {
    if (this.recognitionAutoplayTimer !== null) {
      window.clearInterval(this.recognitionAutoplayTimer);
      this.recognitionAutoplayTimer = null;
    }
  }

  setCategory(category: 'All' | 'Jaggery' | 'Pantry'): void {
    this.selectedCategory = category;
  }

  productWhatsAppLink(product: Product): string {
    const productName = this.translate(product.name);
    const text = this.language === 'kn'
      ? `ನಮಸ್ಕಾರ JAGORAY, ನನಗೆ ${productName} ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು. ದಯವಿಟ್ಟು ವಿವರಗಳು, ಪ್ಯಾಕ್ ಗಾತ್ರಗಳು ಮತ್ತು ಲಭ್ಯತೆ ತಿಳಿಸಿ.`
      : `Hello JAGORAY, I am interested in ${product.name}. Please share product details, pack sizes and availability.`;
    return `https://wa.me/919740813888?text=${encodeURIComponent(text)}`;
  }

  generalWhatsAppLink(message = 'Hello JAGORAY, I want to know more about your products.'): string {
    const text = this.language === 'kn' ? KANNADA_TRANSLATIONS[message] ?? message : message;
    return `https://wa.me/919740813888?text=${encodeURIComponent(text)}`;
  }

  private sanitizeText(value: string | null | undefined, fallback: string, maxLength = 180): string {
    const cleaned = String(value ?? '')
      .replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);

    return cleaned || fallback;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  scrollTo(sectionId: string): void {
    const safeSectionId = this.validSections.has(sectionId) ? sectionId : 'home';
    this.menuOpen = false;
    this.showFloatingBar = true;
    this.activeSection = safeSectionId;
    document.getElementById(safeSectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openProduct(product: Product): void {
    this.selectedProduct = product;
  }

  openGallery(item: GalleryItem): void {
    this.selectedGallery = item;
  }

  closeModal(): void {
    this.selectedProduct = null;
    this.selectedGallery = null;
  }

  submitContact(): void {
    const name = this.sanitizeText(this.contact.name, 'Customer');
    const email = this.sanitizeText(this.contact.email, '');
    const phone = this.sanitizeText(this.contact.phone, '');
    const subject = this.sanitizeText(this.contact.subject, 'JAGORAY Website Enquiry', 120);
    const message = this.sanitizeText(this.contact.message, '', 1200);

    if (!name || !email || !message || !this.isValidEmail(email)) {
      return;
    }

    const formattedMessage = `Hello JAGORAY, I am ${name}.\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject}\n\n${message}`;
    const mailto = `mailto:jagoray.organic@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedMessage)}`;
    window.location.href = mailto;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Element;

    if (
      this.menuOpen &&
      !target.closest('.mobile-menu') &&
      !target.closest('.mobile-toggle')
    ) {
      this.menuOpen = false;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - this.lastScrollY;

    if (window.innerWidth <= 900) {
      if (currentScrollY <= 20) {
        this.isMobileHeaderVisible = true;
      } else if (scrollDelta > 5) {
        this.isMobileHeaderVisible = false;
      } else if (scrollDelta < -5) {
        this.isMobileHeaderVisible = true;
      }
    } else {
      this.isMobileHeaderVisible = true;
    }

    if (currentScrollY <= 24 || Math.abs(scrollDelta) >= 8) {
      this.showFloatingBar = currentScrollY <= 24 || scrollDelta < 0;
      this.lastScrollY = currentScrollY;
    }

    const sections = ['home', 'about', 'products', 'quality', 'gallery', 'contact'];
    const current = sections.find((sectionId) => {
      const section = document.getElementById(sectionId);
      return section && section.getBoundingClientRect().top <= 170 && section.getBoundingClientRect().bottom > 170;
    });

    if (current) {
      this.activeSection = current;
    }
  }

  @HostListener('document:visibilitychange')
  onDocumentVisibilityChange(): void {
    this.startAutoplay();
    this.startRecognitionAutoplay();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }

  private initScrollReveal(): void {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach((item) => this.revealObserver?.observe(item));
  }

  private observeCarousel(selector: string, onVisibilityChange: (isVisible: boolean) => void): void {
    const carousel = document.querySelector(selector);

    if (!carousel || !('IntersectionObserver' in window)) {
      onVisibilityChange(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      onVisibilityChange(entry.isIntersecting);
    }, { threshold: 0.1 });

    observer.observe(carousel);

    if (selector === '.luxury-hero-slider') {
      this.heroVisibilityObserver = observer;
    } else {
      this.recognitionVisibilityObserver = observer;
    }
  }

  private scheduleHeroAnimation(): void {
    if (this.prefersReducedMotion) {
      return;
    }

    if (this.heroAnimationFrame !== null) {
      window.cancelAnimationFrame(this.heroAnimationFrame);
    }

    this.heroAnimationFrame = window.requestAnimationFrame(() => {
      this.heroAnimationFrame = null;
      this.animateActiveHeroSlide();
    });
  }

  private animateActiveHeroSlide(): void {
    if (this.prefersReducedMotion) {
      return;
    }

    const activeSlide = document.querySelector('.luxury-slide.active');
    const content = activeSlide?.querySelectorAll('.luxury-badge, h1, p, .luxury-actions');
    const image = activeSlide?.querySelector('.luxury-slide-image');

    if (!content?.length || !image) {
      return;
    }

    gsap.fromTo(content, { y: 22, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power2.out',
      overwrite: true
    });
    gsap.fromTo(image, { scale: 1.12 }, {
      scale: 1.04,
      duration: 1.1,
      ease: 'power2.out',
      overwrite: true
    });
  }
}
