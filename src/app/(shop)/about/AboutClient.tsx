"use client"

import { Award, Facebook, Heart, Instagram, Linkedin, Phone, TrendingUp, Youtube } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { HorizontalScroll } from "@/components/features/about/HorizontalScroll"
import { StatCard } from "@/components/features/about/StatCard"
import { TeamMemberCard } from "@/components/features/about/TeamMemberCard"
import { ValueCard } from "@/components/features/about/ValueCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CONTACT_INFO } from "@/constants/contact"
import { submitContact } from "@/features/contacts/api"
import { useLanguage } from "@/providers/language.provider"
import { toErrorMessage } from "@/utils/error-message"

export default function AboutClient() {
    const { t } = useLanguage();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const stats = [
        { value: "10+", label: t('about_stats_products', {}, "Products launched successfully"), icon: Award },
        // { value: "5+", label: t('about_stats_partners', {}, "Partner brands"), icon: Users },
        { value: "99%", label: t('about_stats_satisfaction', {}, "Satisfied customers"), icon: Heart },
        { value: "2+", label: t('about_stats_experience', {}, "Years of experience"), icon: TrendingUp },
    ]

    const values = [
        {
            title: t('about_mission_title', {}, "Mission"),
            description: t('about_mission_desc', {}, "We are committed to providing high-quality technology products at reasonable prices, helping everyone access modern technology."),
        },
        {
            title: t('about_vision_title', {}, "Vision"),
            description: t('about_vision_desc', {}, "To become the leading technology distributor in Vietnam, trusted and chosen by customers."),
        },
        {
            title: t('about_values_main_title', {}, "Values"),
            description: t('about_values_desc', {}, "We put customers first, committed to the best product quality and service."),
        },
    ]

    const team = [
        {
            name: "Trần Nguyễn Anh Khoa",
            role: t('about_role_ceo', {}, "CEO & Founder"),
            description: t('about_team_desc', {}, "I want Technologia to help everyone get the best technology products at the best prices."),
        },
        {
            name: "Phạm Quốc Toàn",
            role: t('about_role_cto', {}, "CTO"),
            description: t('about_team_desc', {}, "I want Technologia to help everyone get the best technology products at the best prices."),
        },
        {
            name: "Nguyễn Ngọc Quế Chi",
            role: t('about_role_marketing', {}, "Marketing Director"),
            description: t('about_team_desc', {}, "I want Technologia to help everyone get the best technology products at the best prices."),
        },
    ]

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#3E93B3] to-[#8AB0C3] py-20 px-4">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="w-64 h-64 mx-auto mb-8 relative flex items-center justify-center">
                            {/* Decorative background circles */}
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative w-48 h-48 bg-white p-8 rounded-[3rem] shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500 flex items-center justify-center overflow-hidden border-4 border-white/50">
                                <Image
                                    src="/favicon.ico"
                                    alt="Technologia Logo"
                                    width={120}
                                    height={120}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t('about_hero_title', {}, "Welcome to Technologia")}
                        </h1>
                        <p className="text-xl text-white/90 mb-8">
                            {t('about_hero_subtitle', {}, "Your trusted partner in providing top technology products")}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => scrollToSection('values')}
                                className="bg-white text-[#3E93B3] hover:bg-gray-100 font-semibold px-8"
                            >
                                {t('footer_about_us', {}, "About Us")}
                            </Button>
                            <Button
                                onClick={() => scrollToSection('contact')}
                                variant="outline"
                                className="border-white text-white  bg-[#3E93B3] hover:bg-white/10 font-semibold px-8"
                            >
                                {t('footer_contact_now', {}, "Contact Now")}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Stats Section */}
                <section id="achievements">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {t('about_stats_title', {}, "Our Achievements")}
                    </h2>
                    <HorizontalScroll>
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                icon={stat.icon}
                            />
                        ))}
                    </HorizontalScroll>
                </section>

                {/* Values Section */}
                <section id="values">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {t('about_values_title', {}, "Core Values")}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <ValueCard key={index} title={value.title} description={value.description} />
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section id="team">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {t('about_team_title', {}, "Our Team")}
                    </h2>
                    <HorizontalScroll>
                        {team.map((member, index) => (
                            <TeamMemberCard
                                key={index}
                                name={member.name}
                                role={member.role}
                                description={member.description}
                            />
                        ))}
                    </HorizontalScroll>
                </section>

                {/* Contact Form Section */}
                <section id="contact" className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        {t('about_contact_title', {}, "Contact us whenever you want")}
                    </h2>
                    <p className="text-gray-600 mb-8 text-center">{t('about_contact_subtitle', {}, "We're here to help you")}</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <a href={CONTACT_INFO.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                    <Facebook className="h-6 w-6 text-[#1877F2]" />
                                </a>
                                <a href={CONTACT_INFO.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                    <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                                </a>
                                <a href={CONTACT_INFO.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                    <Instagram className="h-6 w-6 text-[#E4405F]" />
                                </a>
                                <a href={CONTACT_INFO.socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                    <Youtube className="h-6 w-6 text-[#FF0000]" />
                                </a>
                                <a href={`tel:${CONTACT_INFO.phone.value}`} className="hover:opacity-80 transition-opacity">
                                    <Phone className="h-6 w-6 text-[#3E93B3]" />
                                </a>
                            </div>
                            {/* Map Placeholder or Visual Graphic */}
                            <div className="bg-[#D3E4F4] rounded-2xl h-64 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden relative group">
                                <Image
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                                    alt="Technologia Office"
                                    fill
                                    className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="relative z-10 text-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50">
                                    <p className="font-bold text-[#3E93B3] text-lg">Technologia HQ</p>
                                    <p className="text-xs text-gray-600">Ho Chi Minh City, Vietnam</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <strong>{t('about_hotline', {}, "Hotline")}:</strong> {CONTACT_INFO.phone.display}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Email:</strong> {CONTACT_INFO.email}
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <ContactForm />
                    </div>
                </section>
            </div>
        </div>
    )
}

function ContactForm() {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        company: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitContact(formData);
            toast.success(t('about_contact_success', {}, "Message sent successfully! We will contact you soon."));
            setFormData({
                name: "",
                email: "",
                phoneNumber: "",
                company: "",
                message: ""
            });
        } catch (error: unknown) {
            toast.error(toErrorMessage(error, t('about_contact_error', {}, "Failed to send message. Please try again later.")));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('about_name_placeholder', {}, "Name*")}
                className="bg-white border-gray-200 focus:ring-primary h-12"
            />
            <Input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('about_email_placeholder', {}, "Email*")}
                className="bg-white border-gray-200 focus:ring-primary h-12"
            />
            <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('about_phone_placeholder', {}, "Phone number")}
                className="bg-white border-gray-200 focus:ring-primary h-12"
            />
            <Input
                required
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder={t('about_company_placeholder', {}, "Company*")}
                className="bg-white border-gray-200 focus:ring-primary h-12"
            />
            <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('about_message_placeholder', {}, "Message")}
                className="bg-white border-gray-200 min-h-[120px] focus:ring-primary"
            />
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#3E93B3] hover:bg-[#2D7A96] text-white font-bold h-12 rounded-xl transition-all shadow-md"
            >
                {isSubmitting ? t('about_sending', {}, "Sending...") : t('about_send_btn', {}, "Send Message")}
            </Button>
        </form>
    );
}
