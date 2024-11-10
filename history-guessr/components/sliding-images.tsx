import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import ww2Image from "@/public/ww2.png";
import ww1Image from "@/public/worldwar1.jpg";
import coldwarImage from "@/public/Coldwar.jpeg";
import industrialImage from "@/public/indutrialrevolution.png";
import digitalImage from "@/public/digital.jpeg";

// Add type for testimonial
interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export function AnimatedTestimonialsDemo() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "A devastating global conflict claiming 70 million lives. Introduced nuclear weapons and ended with Nazi Germany's defeat, establishing the US and USSR as world superpowers.",
      name: "World War II",
      designation: "Global Conflict, 1939-1945",
      src: ww2Image.src,
    },
    {
      quote:
        "The first industrialized war introduced tanks, aircraft, and chemical warfare. This conflict dissolved four empires, redrew Europe's borders, and claimed 16 million lives.",
      name: "World War I",
      designation: "The Great War, 1914-1918",
      src: ww1Image.src,
    },
    {
      quote:
        "A four-decade ideological battle between the US and USSR. Marked by nuclear arms race, proxy wars, and space race, without direct military conflict.",
      name: "The Cold War",
      designation: "Global Tension Period, 1947-1991",
      src: coldwarImage.src,
    },
    {
      quote:
        "Society transformed from agricultural to manufacturing-based economies. Steam power and factories revolutionized work, creating modern urban industrial civilization.",
      name: "Industrial Revolution",
      designation: "Technological Transformation, 1760-1840",
      src: industrialImage.src,
    },
    {
      quote:
        "The shift from mechanical to digital technology revolutionized human communication. Computers, internet, and AI reshape how we live and work.",
      name: "Digital Revolution",
      designation: "Information Age, 1950s-Present",
      src: digitalImage.src,
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}
