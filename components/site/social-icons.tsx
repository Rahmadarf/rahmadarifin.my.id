import { Globe, Mail } from "lucide-react";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/site/brand-icons";
import type { SocialLinkRow, SocialPlatform } from "@/lib/types/database";

type IconComponent = (props: { className?: string }) => React.ReactNode;

const ICONS: Record<SocialPlatform, IconComponent> = {
  email: (props) => <Mail {...props} />,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  website: (props) => <Globe {...props} />,
};

const LABELS: Record<SocialPlatform, string> = {
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  website: "Website",
};

export function SocialIcons({
  links,
  className,
}: {
  links: SocialLinkRow[];
  className?: string;
}) {
  // Email gets its own prominent button in the Contact card, so it is left out
  // of the icon row.
  const iconLinks = links.filter((link) => link.platform !== "email");
  if (!iconLinks.length) return null;

  return (
    <div className={className ?? "flex justify-center gap-2.5"}>
      {iconLinks.map((link) => {
        const Icon = ICONS[link.platform];
        return (
          <a
            key={link.id}
            href={link.url}
            aria-label={LABELS[link.platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-10 items-center justify-center rounded-[10px] border border-border text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Icon className="size-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
