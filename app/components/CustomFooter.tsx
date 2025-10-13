import { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { getRuntimeConfig } from "@/utils/runtime-config";
import { Twitter, Send, MessageCircle, Github } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  icon: JSX.Element;
}

const CustomFooter: FC = () => {
  const brokerName = getRuntimeConfig('VITE_ORDERLY_BROKER_NAME') || 'Orderly DEX';
  const telegramUrl = getRuntimeConfig('VITE_TELEGRAM_URL');
  const discordUrl = getRuntimeConfig('VITE_DISCORD_URL');
  const twitterUrl = getRuntimeConfig('VITE_TWITTER_URL');
  const githubUrl = getRuntimeConfig('VITE_GITHUB_URL');

  const socialLinks: SocialLink[] = [
    ...(twitterUrl ? [{
      name: 'Twitter',
      href: twitterUrl,
      icon: <Twitter className="oui-w-5 oui-h-5" />
    }] : []),
    ...(telegramUrl ? [{
      name: 'Telegram',
      href: telegramUrl,
      icon: <Send className="oui-w-5 oui-h-5" />
    }] : []),
    ...(discordUrl ? [{
      name: 'Discord',
      href: discordUrl,
      icon: <MessageCircle className="oui-w-5 oui-h-5" />
    }] : []),
    ...(githubUrl ? [{
      name: 'GitHub',
      href: githubUrl,
      icon: <Github className="oui-w-5 oui-h-5" />
    }] : []),
  ];

  return (
    <footer className="oui-w-full oui-bg-base-9 oui-border-t oui-border-line-12">
      <div className="oui-max-w-[1440px] oui-mx-auto oui-px-4 sm:oui-px-6 lg:oui-px-8">
        <Flex
          direction="row"
          justify="between"
          itemAlign="center"
          className="oui-py-6 oui-gap-4 oui-flex-wrap"
        >
          {/* Left Section - Copyright */}
          <div className="oui-flex oui-items-center oui-gap-2">
            <span className="oui-text-xs oui-text-base-contrast-54">
              © {new Date().getFullYear()} {brokerName}. All rights reserved.
            </span>
          </div>

          {/* Center Section - Links */}
          <Flex
            direction="row"
            itemAlign="center"
            className="oui-gap-4 sm:oui-gap-6"
          >
            <a
              href="https://orderly.network/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="oui-text-xs oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-transition-colors oui-no-underline"
            >
              Docs
            </a>
            <a
              href="https://orderly.network/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="oui-text-xs oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-transition-colors oui-no-underline"
            >
              Terms
            </a>
            <a
              href="https://orderly.network/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="oui-text-xs oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-transition-colors oui-no-underline"
            >
              Privacy
            </a>
          </Flex>

          {/* Right Section - Social Links */}
          {socialLinks.length > 0 && (
            <Flex
              direction="row"
              itemAlign="center"
              className="oui-gap-3"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </Flex>
          )}
        </Flex>

    
      </div>
    </footer>
  );
};

export default CustomFooter;
