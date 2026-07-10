import type { ReactNode } from "react";
import { CrudLayout, type CrudLayoutProps } from "./crud-layout";

type CrudPageProps = CrudLayoutProps & {
  sidebar?: ReactNode;
  table?: ReactNode;
};

export function CrudPage({ children, ...props }: CrudPageProps) {
  return <CrudLayout {...props}>{children}</CrudLayout>;
}
