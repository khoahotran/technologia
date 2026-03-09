"use client"

import { Users, TrendingUp, Heart, Award, Facebook, Linkedin, Youtube, Phone } from "lucide-react"

import { HorizontalScroll } from "@/components/features/about/HorizontalScroll"
import { PartnerLogo } from "@/components/features/about/PartnerLogo"
import { StatCard } from "@/components/features/about/StatCard"
import { TeamMemberCard } from "@/components/features/about/TeamMemberCard"
import { ValueCard } from "@/components/features/about/ValueCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/providers/language.provider";

export default function AboutClient() {
    const { t } = useLanguage();
    const stats = [
        { value: "10000+", label: t('about_stats_products', {}, "Products launched successfully"), icon: Award },
        { value: "50+", label: t('about_stats_partners', {}, "Partner brands"), icon: Users },
        { value: "98%", label: t('about_stats_satisfaction', {}, "Satisfied customers"), icon: Heart },
        { value: "20+", label: t('about_stats_experience', {}, "Years of experience"), icon: TrendingUp },
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
            name: "Nguyễn Văn A",
            role: t('about_role_ceo', {}, "CEO & Founder"),
            description: t('about_team_desc', {}, "I want TechStore to help everyone get the best technology products at the best prices."),
        },
        {
            name: "Trần Thị B",
            role: t('about_role_cto', {}, "CTO"),
            description: t('about_team_desc', {}, "I want TechStore to help everyone get the best technology products at the best prices."),
        },
        {
            name: "Lê Văn C",
            role: t('about_role_marketing', {}, "Marketing Director"),
            description: t('about_team_desc', {}, "I want TechStore to help everyone get the best technology products at the best prices."),
        },
        {
            name: "Phạm Thị D",
            role: t('about_role_sales', {}, "Sales Manager"),
            description: t('about_team_desc', {}, "I want TechStore to help everyone get the best technology products at the best prices."),
        },
    ]

    const partners = [
        { name: "Samsung" },
        { name: "Apple" },
        { name: "Acer" },
        { name: "Asus" },
        { name: "Dell" },
        { name: "HP" },
    ]

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#3E93B3] to-[#8AB0C3] py-20 px-4">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="w-64 h-64 mx-auto mb-8 relative">
                            {/* Decorative graphic - simplified version */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8AB0C3] to-[#D3E4F4] rounded-3xl transform rotate-45"></div>
                            <div className="absolute inset-8 bg-gradient-to-br from-[#D3E4F4] to-white rounded-3xl transform rotate-45"></div>
                            <div className="absolute inset-16 bg-white rounded-3xl transform rotate-45"></div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t('about_hero_title', {}, "Welcome to Technologia")}
                        </h1>
                        <p className="text-xl text-white/90 mb-8">
                            {t('about_hero_subtitle', {}, "Your trusted partner in providing top technology products")}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button className="bg-white text-[#3E93B3] hover:bg-gray-100 font-semibold px-8">
                                {t('footer_about_us', {}, "About Us")}
                            </Button>
                            <Button variant="outline" className="border-white text-white  bg-[#3E93B3] hover:bg-white/10 font-semibold px-8">
                                {t('footer_contact_us', {}, "Contact Now")}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            {/* <section className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                        {["Giới thiệu", "Sản phẩm", "Đối tác", "Marketing"].map((tab) => (
                            <button
                                key={tab}
                                className="py-4 px-2 text-gray-600 hover:text-[#3E93B3] whitespace-nowrap border-b-2 border-transparent hover:border-[#3E93B3] transition-colors"
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </section> */}

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Stats Section */}
                <section>
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
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {t('about_values_title', {}, "Core Values")}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <ValueCard key={index} title={value.title} description={value.description} />
                        ))}
                    </div>
                </section>

                {/* Partners Section */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {t('about_partners_title', {}, "Our Partners")}
                    </h2>
                    <HorizontalScroll>
                        {partners.map((partner, index) => (
                            <PartnerLogo key={index} name={partner.name} />
                        ))}
                    </HorizontalScroll>
                </section>

                {/* Team Section */}
                <section>
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
                <section className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        {t('about_contact_title', {}, "Contact us whenever you want")}
                    </h2>
                    <p className="text-gray-600 mb-8 text-center">{t('about_contact_subtitle', {}, "We're here to help you")}</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <Facebook className="h-6 w-6 text-[#1877F2]" />
                                <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                                <Youtube className="h-6 w-6 text-[#FF0000]" />
                                <Phone className="h-6 w-6 text-[#3E93B3]" />
                            </div>
                            <div className="bg-[#D3E4F4] rounded-2xl p-8 h-64"></div>
                            <p className="text-sm text-gray-600">
                                <strong>{t('about_hotline', {}, "Hotline")}:</strong> (+84) 123456789
                            </p>
                        </div>

                        {/* Contact Form */}
                        <form className="space-y-4">
                            <Input
                                placeholder={t('about_name_placeholder', {}, "Name*")}
                                className="bg-white border-gray-200"
                            />
                            <Input
                                type="email"
                                placeholder={t('about_email_placeholder', {}, "Email*")}
                                className="bg-white border-gray-200"
                            />
                            <Input
                                type="tel"
                                placeholder={t('about_phone_placeholder', {}, "Phone number")}
                                className="bg-white border-gray-200"
                            />
                            <Input
                                placeholder={t('about_company_placeholder', {}, "Company*")}
                                className="bg-white border-gray-200"
                            />
                            <Textarea
                                placeholder={t('about_message_placeholder', {}, "Message")}
                                className="bg-white border-gray-200 min-h-[120px]"
                            />
                            <Button className="w-full bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold h-12">
                                {t('about_send_btn', {}, "Send")}
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    )
}
