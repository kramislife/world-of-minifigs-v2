import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import MiscellaneousPreviewImage from "@/assets/media/MiscellaneousPreview.png";

const MiscellaneousPreview = ({ miscQuantity }) => (
  <div className="relative aspect-square select-none transition-all duration-300 hover:-translate-y-1">
    {/* Back Card 3 */}
    <div className="absolute inset-0 translate-x-4.5 translate-y-4.5 rotate-4">
      <Card className="h-full w-full dark:shadow-none" />
    </div>

    {/* Back Card 2 */}
    <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3">
      <Card className="h-full w-full dark:shadow-none" />
    </div>

    {/* Back Card 1 */}
    <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-1">
      <Card className="h-full w-full dark:shadow-none" />
    </div>

    {/* Front Card */}
    <Card className="relative h-full w-full overflow-hidden flex items-center justify-center text-center">
      {/* Background Image */}
      <img
        src={MiscellaneousPreviewImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Floating Count Bubble */}
      <Badge variant="destructive" className="absolute top-2 right-2 z-20">
        +{miscQuantity}
      </Badge>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-background dark:text-foreground">
        <p className="font-extrabold uppercase tracking-wide">Mystery Drop</p>

        <p className="text-xs mt-2">A classic torso chosen at random</p>
      </div>
    </Card>
  </div>
);

export default MiscellaneousPreview;
