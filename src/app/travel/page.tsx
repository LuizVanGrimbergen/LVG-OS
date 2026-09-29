import { TravelView } from "@/features/travel/components/travel-view";
import { getWorldMap } from "@/features/travel/world-map";

export default function TravelPage() {
  return <TravelView map={getWorldMap()} />;
}
