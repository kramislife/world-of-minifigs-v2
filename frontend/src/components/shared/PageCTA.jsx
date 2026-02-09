import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/assets/media/Logo.png";

const PageCTA = ({
  title,
  highlight,
  description,
  buttonText,
  buttonLink,
  buttonOnClick,
  backgroundImage,
  backgroundVideo,
}) => {
  return (
    <section className="relative py-40 px-5 overflow-hidden aspect-4/5 md:aspect-16/5 flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {backgroundVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={Logo}
              alt="Logo placeholder"
              className="max-h-64 max-w-64 object-cover opacity-80"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center text-background dark:text-foreground space-y-5">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight">
          {title}&nbsp;
          {highlight && <span className="text-accent">{highlight}</span>}
        </h2>
        {description && (
          <p className="mx-auto max-w-3xl mb-10">{description}</p>
        )}
        {buttonLink ? (
          <Button asChild variant="bannerOutline" className="h-14 text-md">
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        ) : (
          <Button
            variant="bannerOutline"
            onClick={buttonOnClick}
            className="h-14 text-md"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </section>
  );
};

export default PageCTA;
