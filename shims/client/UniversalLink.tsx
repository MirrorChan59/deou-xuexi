// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/components/UniversalLink
// 原版在浏览器中等价于 <a>，这里直接透传属性。
import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface UniversalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string;
  href?: string;
  children?: ReactNode;
}

export const UniversalLink = ({
  to,
  href,
  children,
  ...rest
}: UniversalLinkProps) => (
  <a href={href ?? to} {...rest}>
    {children}
  </a>
);
