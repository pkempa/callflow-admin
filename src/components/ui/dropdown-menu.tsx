import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
          } as Partial<{ isOpen: boolean; setIsOpen: (open: boolean) => void }>);
        }
        return child;
      })}
    </div>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild,
  isOpen,
  setIsOpen,
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen?.(!isOpen),
    } as Partial<{ onClick: () => void }>);
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen?.(!isOpen)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className = "",
  align = "end",
  sideOffset = 8,
  isOpen,
  setIsOpen,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && ref.current) {
      const triggerElement = ref.current.parentElement;
      if (!triggerElement) return;

      const triggerRect = triggerElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 140; // Estimated height for 2-3 items
      const dropdownWidth = 176; // 11rem = 176px

      // Calculate available space in all directions
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      // const spaceRight = viewportWidth - triggerRect.right;
      // const spaceLeft = triggerRect.left;

      let top: number;
      let left: number;

      // Vertical positioning - prioritize above if not enough space below
      if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
        // Position above
        top = triggerRect.top - dropdownHeight - sideOffset;
      } else if (spaceBelow >= dropdownHeight) {
        // Position below
        top = triggerRect.bottom + sideOffset;
      } else {
        // Not enough space either way - position to fit in viewport
        if (spaceAbove > spaceBelow) {
          top = Math.max(8, triggerRect.top - dropdownHeight - sideOffset);
        } else {
          top = Math.min(
            viewportHeight - dropdownHeight - 8,
            triggerRect.bottom + sideOffset
          );
        }
      }

      // Horizontal positioning based on align prop
      if (align === "end") {
        left = triggerRect.right - dropdownWidth;
        // Ensure it doesn't go off-screen left
        if (left < 8) {
          left = triggerRect.left;
        }
      } else if (align === "start") {
        left = triggerRect.left;
        // Ensure it doesn't go off-screen right
        if (left + dropdownWidth > viewportWidth - 8) {
          left = triggerRect.right - dropdownWidth;
        }
      } else {
        // center
        left = triggerRect.left + triggerRect.width / 2 - dropdownWidth / 2;
        // Ensure it stays within viewport
        left = Math.max(8, Math.min(left, viewportWidth - dropdownWidth - 8));
      }

      setPositionStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 50,
      });
    }
  }, [isOpen, align, sideOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`min-w-[11rem] overflow-hidden rounded-lg border border-gray-100 bg-white py-2 text-gray-900 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-sm ${className}`}
      style={positionStyle}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            setIsOpen,
          } as Partial<{ setIsOpen: (open: boolean) => void }>);
        }
        return child;
      })}
    </div>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  setIsOpen?: (open: boolean) => void;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className = "",
  onClick,
  setIsOpen,
}) => (
  <button
    type="button"
    onClick={() => {
      onClick?.();
      setIsOpen?.(false);
    }}
    className={`group relative flex cursor-pointer select-none items-center rounded-md mx-1 px-3 py-2.5 text-sm font-medium outline-none transition-all duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full text-left active:scale-[0.98] ${className}`}
  >
    {children}
  </button>
);

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className = "",
}) => <div className={`mx-2 my-2 h-px bg-gray-100 ${className}`} />;

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className = "",
}) => (
  <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
    {children}
  </div>
);
