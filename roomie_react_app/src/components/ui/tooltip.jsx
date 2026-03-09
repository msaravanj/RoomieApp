import { Tooltip as ChakraTooltip } from "@chakra-ui/react";
import * as React from "react";

export const Tooltip = React.forwardRef(function Tooltip(props, ref) {
  const {
    showArrow,
    children,
    disabled,
    portalled = true,
    content,
    contentProps = {},
    portalRef,
    ...rest
  } = props;

  if (disabled) return children;

  return (
    <ChakraTooltip
      label={content}
      hasArrow={showArrow}
      isDisabled={disabled}
      portalProps={portalled ? { containerRef: portalRef } : { disabled: true }}
      {...contentProps}
      {...rest}
      ref={ref}
    >
      {children}
    </ChakraTooltip>
  );
});
