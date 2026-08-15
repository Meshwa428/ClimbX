// Legal copy, lifted verbatim from the live site and nothing else — these are the client's
// published terms, not ours to reword. Extracted from the archived RSC payloads by
// `python3 docs/reference/legacy-site/legal.py` (the SSR HTML only carries the sections that
// were open, which is why the earlier text dumps looked half empty).
//
// `kind: "ul"` means the whole section is a bullet list. Otherwise the first block is a
// paragraph and any that follow it are bullets, which is how the original renders them.
export type LegalSection = { title: string; kind: "p" | "ul"; blocks: string[] };
export type LegalDoc = { title: string; effective: string; sections: LegalSection[] };

export const EFFECTIVE = "Effective 17 May 2026";

export const PRIVACY_POLICY: LegalDoc = {
  title: "Privacy policy",
  effective: EFFECTIVE,
  sections: [
    {
      title: "Introduction",
      kind: "p",
      blocks: [
        "Welcome to ClimbX Digital. Your privacy is important to us. This Privacy Policy explains how ClimbX Digital (\"Company,\" \"we,\" \"our,\" or \"us\") collects, uses, stores, and protects your information when you visit our website or use our services.",
      ],
    },
    {
      title: "Information We Collect",
      kind: "ul",
      blocks: [
        "Full Name",
        "Email Address",
        "Phone Number",
        "Business Name",
        "Billing Information",
        "IP Address",
        "Browser Type",
        "Device Information",
        "Website Usage Data",
      ],
    },
    {
      title: "How We Use Your Information",
      kind: "ul",
      blocks: [
        "Provide and improve services",
        "Respond to inquiries",
        "Manage marketing campaigns",
        "Improve website performance",
        "Process invoices and payments",
        "Maintain security",
      ],
    },
    {
      title: "Cookies & Tracking Technologies",
      kind: "p",
      blocks: [
        "Our website may use:",
        "Google Analytics",
        "Meta Pixel",
        "Advertising and remarketing tools",
      ],
    },
    {
      title: "Third-Party Services",
      kind: "p",
      blocks: [
        "We may use:",
      ],
    },
    {
      title: "Data Security",
      kind: "p",
      blocks: [
        "We implement reasonable security measures to protect user information. However, no online transmission can be guaranteed completely secure.",
      ],
    },
    {
      title: "Data Sharing",
      kind: "p",
      blocks: [
        "We may share information:",
        "To provide services",
        "For legal compliance",
        "With trusted service providers",
      ],
    },
    {
      title: "Retention of Information",
      kind: "p",
      blocks: [
        "We may retain information for ongoing projects, legal requirements, and business operations.",
      ],
    },
    {
      title: "Your Rights",
      kind: "p",
      blocks: [
        "Users may request:",
        "Access to data",
        "Correction of data",
        "Deletion of data",
        "Withdrawal of consent",
      ],
    },
    {
      title: "External Links",
      kind: "p",
      blocks: [
        "We are not responsible for the privacy practices of external websites linked from our platform.",
      ],
    },
    {
      title: "Changes to This Policy",
      kind: "p",
      blocks: [
        "We may update this Privacy Policy periodically.",
      ],
    },
    {
      title: "Contact Information",
      kind: "p",
      blocks: [
        "ClimbX Digital",
        "Nagpur, Maharashtra, India",
        "https://climbxdigital.in",
        "climbxdigital@gmail.com",
      ],
    },
  ],
};

export const TERMS_CONDITIONS: LegalDoc = {
  title: "Terms & conditions",
  effective: EFFECTIVE,
  sections: [
    {
      title: "Introduction",
      kind: "p",
      blocks: [
        "Welcome to ClimbX Digital. These Terms & Conditions govern your use of our website, services, and digital platforms operated by ClimbX Digital (\"Company,\" \"we,\" \"our,\" or \"us\"). By accessing our website or engaging with our services, you agree to comply with these Terms & Conditions.",
        "If you do not agree with any part of these terms, please discontinue the use of our website and services immediately.",
      ],
    },
    {
      title: "About Us",
      kind: "p",
      blocks: [
        "ClimbX Digital is a digital marketing and creative agency providing services including but not limited to:",
        "Social Media Marketing",
        "Branding & Creative Design",
        "Website Development",
        "SEO Services",
        "Performance Marketing",
        "Content Creation",
        "Video Production",
        "Advertising Campaign Management",
        "Consulting & Strategy Services",
      ],
    },
    {
      title: "Use of Website",
      kind: "p",
      blocks: [
        "By using this website, you agree that:",
        "You will use the website only for lawful purposes.",
        "You will not misuse, hack, disrupt, or attempt unauthorized access to any part of the website.",
      ],
    },
    {
      title: "Intellectual Property",
      kind: "p",
      blocks: [
        "All content available on this website including logos, branding, graphics, videos, website design, text content, marketing materials, and creative assets are the intellectual property of ClimbX Digital unless otherwise stated.",
      ],
    },
    {
      title: "Service Agreements",
      kind: "p",
      blocks: [
        "All services provided by ClimbX Digital are subject to individual project discussions, quotations, and approvals.",
        "Project timelines, deliverables, revisions, pricing, and scope will be defined separately through proposals, invoices, contracts, emails, WhatsApp confirmations, and written agreements.",
      ],
    },
    {
      title: "Payments & Refund Policy",
      kind: "ul",
      blocks: [
        "Payments must be made as per the agreed invoice schedule.",
        "Delayed payments may result in service pauses or project delays.",
        "Advance payments made for services are non-refundable unless otherwise agreed in writing.",
        "Advertising budgets paid to third-party platforms are non-refundable.",
      ],
    },
    {
      title: "Client Responsibilities",
      kind: "p",
      blocks: [
        "Clients are responsible for providing accurate information, timely approvals, and ensuring they own rights to the materials shared with us.",
      ],
    },
    {
      title: "Third-Party Platforms",
      kind: "p",
      blocks: [
        "Our services may involve platforms such as Meta, Google, YouTube, WordPress, Shopify, hosting providers, and advertising platforms.",
        "We are not responsible for outages, account suspensions, policy changes, algorithm updates, or third-party technical issues.",
      ],
    },
    {
      title: "Results Disclaimer",
      kind: "p",
      blocks: [
        "ClimbX Digital does not guarantee specific sales results, viral reach, lead volume, search engine rankings, revenue growth, or social media performance.",
      ],
    },
    {
      title: "Limitation of Liability",
      kind: "p",
      blocks: [
        "ClimbX Digital shall not be held liable for any direct or indirect losses, business interruptions, data loss, revenue loss, advertising losses, or technical damages arising from the use of our website or services.",
      ],
    },
    {
      title: "Confidentiality",
      kind: "p",
      blocks: [
        "We respect client confidentiality and do not intentionally share confidential business information with third parties unless required by law or authorized by the client.",
      ],
    },
    {
      title: "Website Content Accuracy",
      kind: "p",
      blocks: [
        "We strive to keep website information accurate and updated. However, we do not guarantee completeness, accuracy, availability, or error-free operation.",
      ],
    },
    {
      title: "Termination of Services",
      kind: "p",
      blocks: [
        "We reserve the right to terminate or refuse services for non-payment, misconduct, false information, or violations of legal and ethical standards.",
      ],
    },
    {
      title: "Governing Law",
      kind: "p",
      blocks: [
        "These Terms & Conditions shall be governed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Nagpur, Maharashtra.",
      ],
    },
    {
      title: "Contact Information",
      kind: "p",
      blocks: [
        "ClimbX Digital",
        "Nagpur, Maharashtra, India",
        "https://climbxdigital.in",
        "climbxdigital@gmail.com",
      ],
    },
  ],
};

export const REFUND_POLICY: LegalDoc = {
  title: "Cancellation & refund policy",
  effective: EFFECTIVE,
  sections: [
    {
      title: "Introduction",
      kind: "p",
      blocks: [
        "Welcome to ClimbX Digital. This Cancellation & Refund Policy outlines the terms related to cancellations, refunds, project termination, and service discontinuation for all services offered by ClimbX Digital.",
      ],
    },
    {
      title: "Service-Based Nature of Business",
      kind: "p",
      blocks: [
        "ClimbX Digital provides services including:",
        "Website Development",
        "Social Media Marketing",
        "Branding & Design",
        "SEO Services",
        "Paid Advertising",
        "Content Creation",
        "Video Editing",
        "Consulting & Strategy Services",
      ],
    },
    {
      title: "Project Cancellation by Client",
      kind: "ul",
      blocks: [
        "Advance payments are generally non-refundable.",
        "Work completed until cancellation will be chargeable.",
        "Third-party expenses are non-refundable.",
      ],
    },
    {
      title: "Refund Policy",
      kind: "p",
      blocks: [
        "Non-refundable services include:",
        "SEO Services",
        "Social Media Management",
        "Paid Advertising",
        "Graphic Design",
        "Video Editing",
      ],
    },
    {
      title: "Advertising Budget Policy",
      kind: "p",
      blocks: [
        "Advertising spends on Meta, Google, YouTube, influencers, and promotions are non-refundable once campaigns begin.",
      ],
    },
    {
      title: "Subscription & Retainer Services",
      kind: "p",
      blocks: [
        "Clients must provide at least 7 days prior notice before cancellation of recurring services.",
      ],
    },
    {
      title: "Delayed Response or Inactivity",
      kind: "p",
      blocks: [
        "Projects inactive for more than 30 days may be paused and reactivation charges may apply.",
      ],
    },
    {
      title: "Termination by ClimbX Digital",
      kind: "p",
      blocks: [
        "Services may be terminated due to:",
        "Delayed payments",
        "Misconduct",
        "False information",
        "Illegal or unethical activities",
      ],
    },
    {
      title: "Chargebacks & Payment Disputes",
      kind: "p",
      blocks: [
        "Unauthorized chargebacks after successful service delivery may lead to legal action and permanent service suspension.",
      ],
    },
    {
      title: "Contact Information",
      kind: "p",
      blocks: [
        "ClimbX Digital",
        "Nagpur, Maharashtra, India",
        "https://climbxdigital.in",
        "climbxdigital@gmail.com",
      ],
    },
  ],
};
