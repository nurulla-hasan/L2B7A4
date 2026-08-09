import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { Role, BookingStatus } from "../generated/prisma/enums";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  try {
    console.log("🌱 Seeding database...");

    // ════════════════════════════════════════════════════════════════
    //  CATEGORIES
    // ════════════════════════════════════════════════════════════════
    const categoryNames = [
      "Electrical",
      "Plumbing",
      "Cleaning",
      "Carpentry",
      "Painting",
      "Appliance Repair",
      "Landscaping",
      "Pest Control",
    ];

    const createdCategories = [];
    for (const name of categoryNames) {
      const cat = await prisma.category.upsert({
        where: { id: name.toLowerCase() },
        create: { id: name.toLowerCase(), name },
        update: {},
      });
      createdCategories.push(cat);
    }
    console.log(`  ✅ ${createdCategories.length} categories ready`);

    const [electrical, plumbing, cleaning, carpentry, painting, appliance, landscaping, pestControl] =
      createdCategories;

    // ════════════════════════════════════════════════════════════════
    //  DEMO ACCOUNTS (3 roles)
    // ════════════════════════════════════════════════════════════════
    const hashPassword = (p: string) => bcrypt.hash(p, 12);

    // ── Admin ──
    const admin = await prisma.user.upsert({
      where: { email: "admin@fixitnow.com" },
      create: {
        name: "Admin",
        email: "admin@fixitnow.com",
        password: await hashPassword("admin123"),
        role: Role.ADMIN,
      },
      update: {},
    });
    console.log(`  ✅ Admin: admin@fixitnow.com / admin123`);

    // ── Customer ──
    const customer = await prisma.user.upsert({
      where: { email: "customer@fixitnow.com" },
      create: {
        name: "Nurul Hasan",
        email: "customer@fixitnow.com",
        password: await hashPassword("customer123"),
        role: Role.CUSTOMER,
      },
      update: {},
    });
    console.log(`  ✅ Customer: customer@fixitnow.com / customer123`);

    // ════════════════════════════════════════════════════════════════
    //  TECHNICIANS (6 professionals)
    // ════════════════════════════════════════════════════════════════
    const technicianData = [
      {
        name: "Ariful Islam",
        email: "technician@fixitnow.com",
        skills: "Electrical Wiring, Fan Installation, Lighting Setup, Switch Board Repair",
        experience: "8+ years",
        pricing: 800,
        availability: {
          monday: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"],
          tuesday: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"],
          wednesday: ["9:00 AM - 12:00 PM"],
          thursday: ["9:00 AM - 12:00 PM", "2:00 PM - 6:00 PM"],
          friday: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"],
          saturday: ["10:00 AM - 2:00 PM"],
        },
      },
      {
        name: "Rakib Hossain",
        email: "rakib@fixitnow.com",
        skills: "Pipe Fitting, Leak Repair, Water Heater Installation, Bathroom Renovation",
        experience: "6+ years",
        pricing: 700,
        availability: {
          monday: ["8:00 AM - 1:00 PM"],
          tuesday: ["8:00 AM - 1:00 PM", "3:00 PM - 7:00 PM"],
          wednesday: ["8:00 AM - 1:00 PM"],
          thursday: ["8:00 AM - 1:00 PM", "3:00 PM - 7:00 PM"],
          friday: ["8:00 AM - 1:00 PM"],
          saturday: ["9:00 AM - 3:00 PM"],
        },
      },
      {
        name: "Sumaiya Akter",
        email: "sumaiya@fixitnow.com",
        skills: "Deep Cleaning, Office Cleaning, Carpet Cleaning, Post-Construction Cleanup",
        experience: "4+ years",
        pricing: 500,
        availability: {
          monday: ["8:00 AM - 5:00 PM"],
          tuesday: ["8:00 AM - 5:00 PM"],
          wednesday: ["8:00 AM - 5:00 PM"],
          thursday: ["8:00 AM - 5:00 PM"],
          friday: ["8:00 AM - 5:00 PM"],
        },
      },
      {
        name: "Kamal Mia",
        email: "kamal@fixitnow.com",
        skills: "Furniture Repair, Door/Window Installation, Custom Woodwork, Shelving",
        experience: "10+ years",
        pricing: 900,
        availability: {
          monday: ["9:00 AM - 6:00 PM"],
          wednesday: ["9:00 AM - 6:00 PM"],
          friday: ["9:00 AM - 6:00 PM"],
          saturday: ["9:00 AM - 4:00 PM"],
        },
      },
      {
        name: "Fatema Begum",
        email: "fatema@fixitnow.com",
        skills: "Interior Painting, Exterior Painting, Wall Texture, Color Consultation",
        experience: "5+ years",
        pricing: 650,
        availability: {
          monday: ["10:00 AM - 4:00 PM"],
          tuesday: ["10:00 AM - 4:00 PM"],
          wednesday: ["10:00 AM - 4:00 PM"],
          thursday: ["10:00 AM - 4:00 PM"],
          friday: ["10:00 AM - 4:00 PM"],
          saturday: ["10:00 AM - 1:00 PM"],
        },
      },
      {
        name: "Sabbir Rahman",
        email: "sabbir@fixitnow.com",
        skills: "AC Repair, Washing Machine Fix, Refrigerator Service, Microwave Repair",
        experience: "7+ years",
        pricing: 750,
        availability: {
          monday: ["9:00 AM - 12:00 PM", "3:00 PM - 7:00 PM"],
          tuesday: ["9:00 AM - 12:00 PM", "3:00 PM - 7:00 PM"],
          thursday: ["9:00 AM - 12:00 PM", "3:00 PM - 7:00 PM"],
          friday: ["9:00 AM - 12:00 PM", "3:00 PM - 6:00 PM"],
          saturday: ["10:00 AM - 4:00 PM"],
        },
      },
    ];

    const technicians = [];
    for (const tech of technicianData) {
      const user = await prisma.user.upsert({
        where: { email: tech.email },
        create: {
          name: tech.name,
          email: tech.email,
          password: await hashPassword("technician123"),
          role: Role.TECHNICIAN,
        },
        update: {},
      });

      await prisma.technicianProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          skills: tech.skills,
          experience: tech.experience,
          pricing: tech.pricing,
        },
        update: {
          skills: tech.skills,
          experience: tech.experience,
          pricing: tech.pricing,
        },
      });

      technicians.push(user);
    }
    console.log(`  ✅ ${technicians.length} technicians created`);

    // ════════════════════════════════════════════════════════════════
    //  SERVICES (12 services across categories)
    // ════════════════════════════════════════════════════════════════
    const servicesData = [
      { name: "Full Home Electrical Inspection", description: "Comprehensive safety inspection of all electrical systems including wiring, outlets, circuit breakers, and grounding. Get a detailed report with recommendations.", price: 2500, location: "Dhanmondi, Dhaka", categoryId: electrical.id, techIndex: 0 },
      { name: "Emergency Leak Repair", description: "Fast response to fix burst pipes, leaking faucets, and water damage. Available 24/7 for urgent plumbing emergencies in your area.", price: 1500, location: "Gulshan, Dhaka", categoryId: plumbing.id, techIndex: 1 },
      { name: "Deep Home Cleaning", description: "Professional deep cleaning service covering every corner — kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products used.", price: 3500, location: "Banani, Dhaka", categoryId: cleaning.id, techIndex: 2 },
      { name: "Custom Bookshelf Installation", description: "Handcrafted bookshelves designed to fit your space perfectly. Includes measurement, design consultation, and professional installation.", price: 8000, location: "Uttara, Dhaka", categoryId: carpentry.id, techIndex: 3 },
      { name: "Interior Wall Painting", description: "Transform your rooms with fresh, vibrant colors. Includes surface preparation, primer, two coats of premium paint, and cleanup.", price: 4500, location: "Mirpur, Dhaka", categoryId: painting.id, techIndex: 4 },
      { name: "AC Servicing & Repair", description: "Complete AC tune-up including gas refilling, filter cleaning, coil wash, and performance check. Works with all major brands.", price: 2000, location: "Motijheel, Dhaka", categoryId: appliance.id, techIndex: 5 },
      { name: "Fan Installation & Wiring", description: "Professional ceiling fan or exhaust fan installation with proper wiring and switch setup. Includes balancing and testing.", price: 1200, location: "Mohammadpur, Dhaka", categoryId: electrical.id, techIndex: 0 },
      { name: "Bathroom Renovation", description: "Complete bathroom makeover including pipe replacement, tile fitting, fixture installation, and waterproofing.", price: 15000, location: "Bashundhara, Dhaka", categoryId: plumbing.id, techIndex: 1 },
      { name: "Office Space Deep Clean", description: "Thorough cleaning of office spaces including desks, floors, windows, and common areas. Scheduled at your convenience.", price: 5000, location: "Motijheel, Dhaka", categoryId: cleaning.id, techIndex: 2 },
      { name: "Door & Window Repair", description: "Fix squeaky doors, broken windows, damaged frames, and install new locks. Quick and reliable carpentry service.", price: 1800, location: "Tejgaon, Dhaka", categoryId: carpentry.id, techIndex: 3 },
      { name: "Exterior Building Painting", description: "Weather-resistant exterior painting for houses and buildings. Includes surface cleaning, putty work, primer, and premium finish.", price: 12000, location: "Lalmatia, Dhaka", categoryId: painting.id, techIndex: 4 },
      { name: "Refrigerator Service & Gas Refill", description: "Complete refrigerator diagnostics, deep cleaning, gas refilling, and compressor check. Extends the life of your appliance.", price: 2200, location: "Farmgate, Dhaka", categoryId: appliance.id, techIndex: 5 },
    ];

    const createdServices = [];
    for (const svc of servicesData) {
      const service = await prisma.service.create({
        data: {
          name: svc.name,
          description: svc.description,
          price: svc.price,
          location: svc.location,
          categoryId: svc.categoryId,
          technicianId: technicians[svc.techIndex].id,
        },
      });
      createdServices.push(service);
    }
    console.log(`  ✅ ${createdServices.length} services created`);

    // ════════════════════════════════════════════════════════════════
    //  BOOKINGS (8 bookings with various statuses)
    // ════════════════════════════════════════════════════════════════
    const now = new Date();

    const bookingsData = [
      { customerId: customer.id, technicianId: technicians[0].id, serviceId: createdServices[0].id, date: daysAgo(10), slot: "10:00 AM - 12:00 PM", status: BookingStatus.COMPLETED },
      { customerId: customer.id, technicianId: technicians[1].id, serviceId: createdServices[1].id, date: daysAgo(8), slot: "2:00 PM - 4:00 PM", status: BookingStatus.COMPLETED },
      { customerId: customer.id, technicianId: technicians[2].id, serviceId: createdServices[2].id, date: daysAgo(5), slot: "9:00 AM - 12:00 PM", status: BookingStatus.COMPLETED },
      { customerId: customer.id, technicianId: technicians[0].id, serviceId: createdServices[6].id, date: daysAgo(3), slot: "11:00 AM - 1:00 PM", status: BookingStatus.COMPLETED },
      { customerId: customer.id, technicianId: technicians[4].id, serviceId: createdServices[4].id, date: daysAgo(2), slot: "3:00 PM - 6:00 PM", status: BookingStatus.IN_PROGRESS },
      { customerId: customer.id, technicianId: technicians[5].id, serviceId: createdServices[5].id, date: daysAgo(1), slot: "10:00 AM - 12:00 PM", status: BookingStatus.REQUESTED },
      { customerId: customer.id, technicianId: technicians[3].id, serviceId: createdServices[3].id, date: daysAgo(0), slot: "2:00 PM - 5:00 PM", status: BookingStatus.PAID },
      { customerId: customer.id, technicianId: technicians[1].id, serviceId: createdServices[7].id, date: daysAgo(7), slot: "9:00 AM - 5:00 PM", status: BookingStatus.DECLINED },
    ];

    const createdBookings = [];
    for (const booking of bookingsData) {
      const b = await prisma.booking.create({
        data: {
          customerId: booking.customerId,
          technicianId: booking.technicianId,
          serviceId: booking.serviceId,
          scheduleDate: booking.date,
          timeSlot: booking.slot,
          status: booking.status,
        },
      });
      createdBookings.push(b);
    }
    console.log(`  ✅ ${createdBookings.length} bookings created`);

    // ════════════════════════════════════════════════════════════════
    //  REVIEWS (3 reviews on completed bookings)
    // ════════════════════════════════════════════════════════════════
    const completedBookings = createdBookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );

    const reviewsData = [
      { bookingIndex: 0, rating: 5, comment: "Ariful did an excellent job with the electrical inspection. Very thorough and professional. Found issues we didn't even know about. Highly recommend!" },
      { bookingIndex: 1, rating: 4, comment: "Rakib fixed the leak quickly and the price was fair. Only minor issue — arrived 15 minutes late. Otherwise great service." },
      { bookingIndex: 2, rating: 5, comment: "Sumaiya and her team made our home sparkle! Every corner was spotless. Will definitely book again for our monthly cleaning." },
    ];

    for (const review of reviewsData) {
      if (completedBookings[review.bookingIndex]) {
        await prisma.review.create({
          data: {
            bookingId: completedBookings[review.bookingIndex].id,
            rating: review.rating,
            comment: review.comment,
          },
        });
      }
    }
    console.log(`  ✅ ${reviewsData.length} reviews created`);

    // ════════════════════════════════════════════════════════════════
    //  SUMMARY
    // ════════════════════════════════════════════════════════════════
    console.log("");
    console.log("  ========================================");
    console.log("           SEED COMPLETE!");
    console.log("  ========================================");
    console.log("");
    console.log("  Demo Credentials:");
    console.log("  ------------------");
    console.log("  Admin:      admin@fixitnow.com / admin123");
    console.log("  Customer:   customer@fixitnow.com / customer123");
    console.log("  Technician: technician@fixitnow.com / technician123");
    console.log("");
    console.log("  Stats:");
    console.log("  ------------------");
    console.log("  Categories : " + createdCategories.length);
    console.log("  Users      : " + (technicianData.length + 2));
    console.log("  Services   : " + createdServices.length);
    console.log("  Bookings   : " + createdBookings.length);
    console.log("  Reviews    : " + reviewsData.length);
    console.log("  ========================================");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

seed();
