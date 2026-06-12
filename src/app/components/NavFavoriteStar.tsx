import "@patternfly/react-core/dist/styles/base-no-reset.css";
import { Tooltip } from "@patternfly/react-core";
import OutlinedStarIcon from "@patternfly/react-icons/dist/esm/icons/outlined-star-icon";
import StarIcon from "@patternfly/react-icons/dist/esm/icons/star-icon";
import { toggleNavFavorite, useNavFavoriteLabels } from "../navigation/navFavorites";

const navControlFadeClassName =
  "opacity-0 transition-opacity duration-150 ease-in group-hover:opacity-100 group-hover:duration-500 group-hover:ease-out focus-visible:opacity-100";

export function NavFavoriteStar({
  label,
  userId,
  isActive,
}: {
  label: string;
  userId: string;
  isActive: boolean;
}) {
  const favoriteLabels = useNavFavoriteLabels(userId);
  const isFavorited = favoriteLabels.includes(label);

  const outlineColor = isActive
    ? "var(--primary-foreground)"
    : "var(--foreground)";
  const filledColor = isActive ? "var(--primary-foreground)" : "var(--primary)";

  return (
    <Tooltip
      content={isFavorited ? "Remove from favorites" : "Add to favorites"}
      entryDelay={1000}
      position="right"
      appendTo={() => document.body}
    >
      <button
        type="button"
        className={`absolute right-[12px] top-1/2 z-10 flex size-[20px] -translate-y-1/2 items-center justify-center rounded-[var(--radius)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${navControlFadeClassName}`}
        aria-label={isFavorited ? `Remove ${label} favorite` : `Favorite ${label}`}
        aria-pressed={isFavorited}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleNavFavorite(userId, label);
        }}
      >
        {isFavorited ? (
          <StarIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: filledColor,
            }}
            aria-hidden
          />
        ) : (
          <OutlinedStarIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: outlineColor,
            }}
            aria-hidden
          />
        )}
      </button>
    </Tooltip>
  );
}
