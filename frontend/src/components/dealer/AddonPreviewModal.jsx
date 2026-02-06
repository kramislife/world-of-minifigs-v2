import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Logo from "@/assets/media/Logo.png";

const AddonPreviewModal = ({ addon, onClose, onSelect }) => {
  if (!addon) return null;

  return (
    <Dialog open={!!addon} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>{addon.addonName} Items</DialogTitle>
          <DialogDescription className="sr-only">
            Review the parts included in this premium add-on before selecting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {addon.items?.map((item, index) => (
              <div
                key={index}
                className="p-0 border border-border rounded-md overflow-hidden shadow-none"
              >
                <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={Logo}
                      alt="Placeholder"
                      className="max-h-40 max-w-40 object-contain opacity-80"
                    />
                  )}
                </div>
                <div className="p-2 bg-background border-t border-border space-y-1">
                  <h3
                    className="text-md font-bold line-clamp-1"
                    title={item.itemName}
                  >
                    {item.itemName}
                  </h3>
                  {item.color && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-normal">
                        {item.color.colorName}
                      </span>
                    </div>
                  )}
                  {item.itemPrice > 0 && (
                    <p className="text-sm font-bold text-success dark:text-accent mt-1">
                      ${item.itemPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={() => onSelect(addon._id)}>
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddonPreviewModal;

//   <Dialog open={!!addon} onOpenChange={onClose}>
//   <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col gap-0">
//     <DialogHeader>
//       <DialogTitle>{addon.addonName} Items</DialogTitle>
//       <DialogDescription className="sr-only">
//         Review the parts included in this premium add-on before selecting.
//       </DialogDescription>
//     </DialogHeader>

//     <div className="flex-1 overflow-y-auto">
//       <div className="grid grid-cols-1 gap-2">
//         {addon.items?.map((item, index) => (
//           <Card
//             key={index}
//             className="p-0 border border-border rounded-md overflow-hidden shadow-none"
//           >
//             <CardContent className="flex flex-row items-start gap-3 pt-2 px-2 pb-1">
//               <div className="shrink-0 rounded border flex items-center justify-center transition-all duration-300 w-20 h-20">
//                 {item.image?.url ? (
//                   <img
//                     src={item.image.url}
//                     alt={item.itemName}
//                     className="object-cover aspect-square"
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center w-full h-full">
//                     <img
//                       src={Logo}
//                       alt="Placeholder"
//                       className="max-h-40 max-w-40 object-contain opacity-80"
//                     />
//                   </div>
//                 )}
//               </div>

//               <div className="flex flex-col">
//                 <h4
//                   className="text-lg font-semibold line-clamp-1"
//                   title={item.itemName}
//                 >
//                   {item.itemName}
//                 </h4>

//                 {item.color && (
//                   <p className="text-sm text-muted-foreground font-medium py-1">
//                     {item.color.colorName}
//                   </p>
//                 )}

//                 <div className="flex flex-wrap gap-2">
//                   {item.itemPrice > 0 && (
//                     <div className="flex items-center gap-1 text-lg">
//                       <span className="font-semibold">Total Value:</span>
//                       <span className="text-success dark:text-accent font-bold">
//                         ${item.itemPrice.toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>

//     <DialogFooter className="pt-3">
//       <Button variant="outline" onClick={onClose}>
//         Cancel
//       </Button>
//       <Button variant="accent" onClick={() => onSelect(addon._id)}>
//         Add to Order
//       </Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
