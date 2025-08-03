// Footer.tsx
import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  ShoppingBag,
  User,
  Package,
  RefreshCw,
  CreditCard,
  Truck,
  HelpCircle
} from 'lucide-react';
import './Footer.scss';

interface FooterLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  className: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const companyInfo: CompanyInfo = {
    name: "Ecommerce Shop",
    address: "18 Phố viên, Đức thắng, Bắc từ liêm, Hà Nội",
    phone: "(028) 1234 5678",
    email: "contact@ecommerceshop.com"
  };

  const quickLinks: FooterLink[] = [
    { 
      label: "Sản phẩm", 
      href: "/products", 
      icon: <ShoppingBag size={16} /> 
    },
    { 
      label: "Tài khoản", 
      href: "/account", 
      icon: <User size={16} /> 
    },
    { 
      label: "Đơn hàng", 
      href: "/orders", 
      icon: <Package size={16} /> 
    },
    { 
      label: "Chính sách đổi trả", 
      href: "/return-policy", 
      icon: <RefreshCw size={16} /> 
    },
    { 
      label: "Điều khoản sử dụng", 
      href: "/terms" 
    },
    { 
      label: "Chính sách bảo mật", 
      href: "/privacy" 
    }
  ];

  const customerSupport: FooterLink[] = [
    { 
      label: "Hướng dẫn mua hàng", 
      href: "/buying-guide", 
      icon: <HelpCircle size={16} /> 
    },
    { 
      label: "Phương thức thanh toán", 
      href: "/payment", 
      icon: <CreditCard size={16} /> 
    },
    { 
      label: "Theo dõi đơn hàng", 
      href: "/track-order", 
      icon: <Truck size={16} /> 
    },
    { 
      label: "Câu hỏi thường gặp", 
      href: "/faq", 
      icon: <HelpCircle size={16} /> 
    },
    { 
      label: "Liên hệ hỗ trợ", 
      href: "/support" 
    }
  ];

  const socialLinks: SocialLink[] = [
    { 
      name: "Facebook", 
      href: "https://facebook.com/ecommerceshop", 
      icon: <Facebook size={20} />,
      className: "footer__social-link--facebook"
    },
    { 
      name: "Instagram", 
      href: "https://instagram.com/ecommerceshop", 
      icon: <Instagram size={20} />,
      className: "footer__social-link--instagram"
    },
    { 
      name: "Twitter", 
      href: "https://twitter.com/ecommerceshop", 
      icon: <Twitter size={20} />,
      className: "footer__social-link--twitter"
    },
    { 
      name: "YouTube", 
      href: "https://youtube.com/ecommerceshop", 
      icon: <Youtube size={20} />,
      className: "footer__social-link--youtube"
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
      setEmail('');
    }
  };

  const handleLinkClick = (href: string) => {
    console.log('Navigate to:', href);
    // Implement your navigation logic here
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          
          {/* Company Information */}
          <div className="footer__section">
            <h3 className="footer__section-title">Thông tin công ty</h3>
            <div className="footer__section-content">
              <h4 className="footer__company-name">{companyInfo.name}</h4>
              
              <div className="footer__company-info">
                <MapPin size={16} />
                <span>{companyInfo.address}</span>
              </div>
              
              <div className="footer__company-info">
                <Phone size={16} />
                <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}>
                  {companyInfo.phone}
                </a>
              </div>
              
              <div className="footer__company-info">
                <Mail size={16} />
                <a href={`mailto:${companyInfo.email}`}>
                  {companyInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h3 className="footer__section-title">Liên kết nhanh</h3>
            <div className="footer__section-content">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  className="footer__link"
                  onClick={() => handleLinkClick(link.href)}
                >
                  {link.icon && <span className="footer__link-icon">{link.icon}</span>}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="footer__section">
            <h3 className="footer__section-title">Hỗ trợ khách hàng</h3>
            <div className="footer__section-content">
              {customerSupport.map((link, index) => (
                <button
                  key={index}
                  className="footer__link"
                  onClick={() => handleLinkClick(link.href)}
                >
                  {link.icon && <span className="footer__link-icon">{link.icon}</span>}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="footer__section">
            <h3 className="footer__section-title">Kết nối với chúng tôi</h3>
            <div className="footer__section-content">
              
              {/* Social Links */}
              <div className="footer__social-links">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer__social-link ${social.className}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              
              {/* Newsletter */}
              <div className="footer__newsletter">
                <h4 className="footer__newsletter-title">Đăng ký nhận tin</h4>
                <form className="footer__newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="footer__newsletter-input"
                    placeholder="Email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="footer__newsletter-button">
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer__copyright">
        <div className="footer__copyright-container">
          <div className="footer__copyright-text">
            © 2025 {companyInfo.name}. Tất cả quyền được bảo lưu.
          </div>
          <div className="footer__copyright-text">
            Design by <span className="footer__copyright-designer">[Tên bạn]</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;