import { Card, CardTitle, SmallText, IconContainer } from '../../imports/UIComponents';

type QuickCreateCardProps = {
  title: string;
  description: string;
  icon: JSX.Element;
  iconBg: string;
  available: boolean;
  locked?: boolean;
};

export function QuickCreateCard({
  title,
  description,
  icon,
  iconBg,
  available,
  locked = false,
}: QuickCreateCardProps) {
  return (
    <Card
      hover={available}
      onClick={available ? () => {} : undefined}
      className={`relative ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="relative">
        {/* Icon */}
        <IconContainer
          bgColor={iconBg}
          className="mb-4"
        >
          {icon}
        </IconContainer>

        {/* Lock indicator */}
        {locked && (
          <div className="absolute top-0 right-0">
            <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
              <path
                d="M11.3333 0.666667H2C1.26362 0.666667 0.666667 1.26362 0.666667 2V6.66667C0.666667 7.40305 1.26362 8 2 8H11.3333C12.0697 8 12.6667 7.40305 12.6667 6.66667V2C12.6667 1.26362 12.0697 0.666667 11.3333 0.666667Z"
                stroke="var(--muted-foreground)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.33333"
              />
              <path
                d="M0.666667 6.66667V4C0.666667 3.11595 1.01786 2.2681 1.64298 1.64298C2.2681 1.01786 3.11595 0.666667 4 0.666667C4.88406 0.666667 5.7319 1.01786 6.35702 1.64298C6.98214 2.2681 7.33333 3.11595 7.33333 4V6.66667"
                stroke="var(--muted-foreground)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.33333"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <CardTitle>{title}</CardTitle>
      <SmallText muted>{description}</SmallText>
    </Card>
  );
}