/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "./styles.css";
import { AppTextProps } from "./types";
import { getVariantClass, getFontWeight, getVariantTag } from "./utils";

/**
 * AppText — Componente tipográfico reutilizable.
 *
 * @example
 *   <AppText.H1>Hola mundo</AppText.H1>
 *   <AppText.P2 weight="bold">Texto medio</AppText.P2>
 */
type TextBaseProps<T extends React.ElementType = 'span'> = AppTextProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof AppTextProps | 'as'>;

const TextBase = <T extends React.ElementType = 'span'>({
  children,
  variant,
  weight,
  className = "",
  as,
  ...rest
}: TextBaseProps<T>) => {
  const Tag = as || getVariantTag(variant);

  return (
    <Tag
      className={`${getVariantClass(variant)} ${className}`}
      style={{
        fontWeight: getFontWeight(weight),
        ...(rest as any).style || {},
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const AppText = Object.assign(TextBase, {
  H1: (props: AppTextProps) => <TextBase {...props} variant="H1" />,
  H2: (props: AppTextProps) => <TextBase {...props} variant="H2" />,
  H3: (props: AppTextProps) => <TextBase {...props} variant="H3" />,
  L1: (props: AppTextProps) => <TextBase {...props} variant="L1" />,
  L2: (props: AppTextProps) => <TextBase {...props} variant="L2" />,
  L3: (props: AppTextProps) => <TextBase {...props} variant="L3" />,
  P1: (props: AppTextProps) => <TextBase {...props} variant="P1" />,
  P2: (props: AppTextProps) => <TextBase {...props} variant="P2" />,
  P3: (props: AppTextProps) => <TextBase {...props} variant="P3" />,
  T1: (props: AppTextProps) => <TextBase {...props} variant="T1" />,
  T2: (props: AppTextProps) => <TextBase {...props} variant="T2" />,
  T3: (props: AppTextProps) => <TextBase {...props} variant="T3" />,
});
