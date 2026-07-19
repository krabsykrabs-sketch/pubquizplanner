/* @ds-bundle: {"format":4,"namespace":"PubQuizPlannerDesignSystem_e327fe","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CategoryTile","sourcePath":"components/surfaces/CategoryTile.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"6410c8b92390","components/core/Button.jsx":"d8a52a81e929","components/core/IconButton.jsx":"18f45b032514","components/core/Tag.jsx":"294ad0e31b3b","components/feedback/Dialog.jsx":"5e9c422d8938","components/forms/Checkbox.jsx":"42af7340a816","components/forms/Input.jsx":"04a47a3bd8d7","components/forms/Radio.jsx":"128546466aa6","components/forms/Select.jsx":"aa0fe3b255ad","components/forms/Switch.jsx":"742508f572ec","components/forms/Textarea.jsx":"9207fb765df7","components/navigation/Tabs.jsx":"56790ba84a08","components/surfaces/Card.jsx":"02d17c122dc9","components/surfaces/CategoryTile.jsx":"ed8a60fc8930","ui_kits/app/App.jsx":"1823334e2fcb","ui_kits/marketing/Home.jsx":"54a9020b2402"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PubQuizPlannerDesignSystem_e327fe = window.PubQuizPlannerDesignSystem_e327fe || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  neutral: {
    bg: 'var(--surface-inset)',
    fg: 'var(--text-muted)',
    bd: 'var(--border-subtle)'
  },
  accent: {
    bg: 'var(--accent-soft)',
    fg: 'var(--accent-text)',
    bd: 'transparent'
  },
  success: {
    bg: 'var(--success-soft)',
    fg: 'var(--success)',
    bd: 'transparent'
  },
  danger: {
    bg: 'var(--danger-soft)',
    fg: 'var(--danger)',
    bd: 'transparent'
  }
};

/** Small status/label pill. */
function Badge({
  tone = 'neutral',
  children,
  style,
  ...rest
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      background: t.bg,
      color: t.fg,
      border: `1px solid ${t.bd}`,
      fontFamily: 'var(--font-body)',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    padding: '6px 12px',
    fontSize: '0.8125rem',
    gap: '6px',
    minHeight: '32px'
  },
  md: {
    padding: '9px 18px',
    fontSize: '0.9375rem',
    gap: '8px',
    minHeight: '40px'
  },
  lg: {
    padding: '13px 26px',
    fontSize: '1.0625rem',
    gap: '10px',
    minHeight: '50px'
  }
};
function palette(variant) {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--surface-card)',
        color: 'var(--text-strong)',
        border: '1.5px solid var(--border-strong)',
        hoverBg: 'var(--surface-inset)'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-body)',
        border: '1.5px solid transparent',
        hoverBg: 'var(--surface-inset)'
      };
    case 'danger':
      return {
        background: 'var(--danger)',
        color: '#fff',
        border: '1.5px solid transparent',
        hoverBg: 'var(--red-600)'
      };
    case 'primary':
    default:
      return {
        background: 'var(--accent)',
        color: 'var(--text-on-accent)',
        border: '1.5px solid transparent',
        hoverBg: 'var(--accent-hover)'
      };
  }
}

/** Primary call-to-action and general button. */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft,
  iconRight,
  as,
  href,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const p = palette(variant);
  const Tag = as || (href ? 'a' : 'button');
  const css = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    minHeight: s.minHeight,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: s.fontSize,
    lineHeight: 1,
    letterSpacing: '0.01em',
    textDecoration: 'none',
    borderRadius: 'var(--radius-md)',
    border: p.border,
    background: disabled ? 'var(--surface-inset)' : hover ? p.hoverBg : p.background,
    color: disabled ? 'var(--text-faint)' : p.color,
    width: fullWidth ? '100%' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
    transform: hover && !disabled ? 'translateY(-1px)' : 'none',
    boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-sm)' : 'none',
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: disabled ? undefined : onClick,
    disabled: Tag === 'button' ? disabled : undefined,
    "aria-disabled": disabled || undefined,
    style: css,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    },
    "aria-hidden": true
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    },
    "aria-hidden": true
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: 32,
  md: 40,
  lg: 50
};
function palette(variant) {
  switch (variant) {
    case 'solid':
      return {
        background: 'var(--accent)',
        color: 'var(--text-on-accent)',
        border: '1.5px solid transparent',
        hoverBg: 'var(--accent-hover)'
      };
    case 'outline':
      return {
        background: 'var(--surface-card)',
        color: 'var(--text-strong)',
        border: '1.5px solid var(--border-strong)',
        hoverBg: 'var(--surface-inset)'
      };
    case 'ghost':
    default:
      return {
        background: 'transparent',
        color: 'var(--text-body)',
        border: '1.5px solid transparent',
        hoverBg: 'var(--surface-inset)'
      };
  }
}

/** Square icon-only button. Always pass an aria-label. */
function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  label,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const p = palette(variant);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      borderRadius: 'var(--radius-md)',
      border: p.border,
      background: disabled ? 'var(--surface-inset)' : hover ? p.hoverBg : p.background,
      color: disabled ? 'var(--text-faint)' : p.color,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Interactive/removable category tag. */
function Tag({
  children,
  selected = false,
  onClick,
  onRemove,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      borderRadius: 'var(--radius-full)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.4,
      cursor: interactive ? 'pointer' : 'default',
      background: selected ? 'var(--accent)' : hover && interactive ? 'var(--surface-inset)' : 'var(--surface-card)',
      color: selected ? 'var(--text-on-accent)' : 'var(--text-body)',
      border: `1.5px solid ${selected ? 'transparent' : 'var(--border-strong)'}`,
      transition: 'all var(--dur) var(--ease-out)',
      ...style
    }
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    style: {
      display: 'inline-flex',
      opacity: 0.7,
      marginRight: '-2px'
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Centered modal dialog with scrim. Render conditionally on `open`. */
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  width = 460,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(22, 17, 13, 0.55)',
      backdropFilter: 'blur(3px)',
      animation: 'pqp-fade var(--dur) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      animation: 'pqp-pop var(--dur-slow) var(--ease-out)',
      ...style
    }
  }, rest), (title || description) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 24px 0'
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9375rem',
      lineHeight: 1.5,
      color: 'var(--text-muted)'
    }
  }, description)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      padding: '0 24px 24px'
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, `@keyframes pqp-fade{from{opacity:0}to{opacity:1}}@keyframes pqp-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Checkbox with label. Controlled via `checked`/`onChange`. */
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9375rem',
      color: disabled ? 'var(--text-faint)' : 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      flex: 'none',
      borderRadius: 'var(--radius-sm)',
      background: checked ? 'var(--accent)' : 'var(--surface-card)',
      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
      color: 'var(--text-on-accent)',
      transition: 'all var(--dur) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2l2.3 2.3 4.7-5",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text field with label, hint, and error states. */
function Input({
  label,
  hint,
  error,
  iconLeft,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'var(--text-body)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 12px',
      background: 'var(--surface-card)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      minHeight: '42px',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-faint)'
    },
    "aria-hidden": true
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'inherit',
      fontSize: '0.9375rem',
      color: 'var(--text-strong)',
      minWidth: 0,
      ...style
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: error ? 'var(--danger)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Single radio option. Group by shared `name`. */
function Radio({
  label,
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9375rem',
      color: disabled ? 'var(--text-faint)' : 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-card)',
      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
      transition: 'all var(--dur) var(--ease-out)'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '10px',
      height: '10px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to the system. */
function Select({
  label,
  hint,
  error,
  id,
  children,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'var(--text-body)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      width: '100%',
      padding: '0 38px 0 12px',
      minHeight: '42px',
      background: 'var(--surface-card)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'inherit',
      fontSize: '0.9375rem',
      color: 'var(--text-strong)',
      cursor: 'pointer',
      outline: 'none',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
      ...style
    }
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--text-muted)',
      fontSize: '0.7rem'
    }
  }, "\u25BC")), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: error ? 'var(--danger)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** On/off switch. Controlled via `checked`/`onChange`. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  style,
  ...rest
}) {
  const inputId = id || React.useId();
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9375rem',
      color: 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: '42px',
      height: '24px',
      flex: 'none',
      padding: 0,
      border: 'none',
      borderRadius: 'var(--radius-full)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? 'var(--accent)' : 'var(--border-strong)',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '3px',
      left: checked ? '21px' : '3px',
      width: '18px',
      height: '18px',
      borderRadius: 'var(--radius-full)',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    checked: checked,
    readOnly: true,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text field. */
function Textarea({
  label,
  hint,
  error,
  id,
  rows = 4,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-body)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'var(--text-body)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      resize: 'vertical',
      padding: '10px 12px',
      background: 'var(--surface-card)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'inherit',
      fontSize: '0.9375rem',
      lineHeight: 1.5,
      color: 'var(--text-strong)',
      outline: 'none',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
      ...style
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: error ? 'var(--danger)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Underline tab bar. Controlled via `value`/`onChange`; items: [{value,label}]. */
function Tabs({
  items = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, rest), items.map(it => {
    const active = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(it.value),
      style: {
        position: 'relative',
        padding: '10px 14px',
        border: 'none',
        background: 'transparent',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9375rem',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--text-strong)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'color var(--dur) var(--ease-out)'
      }
    }, it.label, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      style: {
        position: 'absolute',
        left: '10px',
        right: '10px',
        bottom: '-1px',
        height: '2.5px',
        borderRadius: '2px',
        background: active ? 'var(--accent)' : 'transparent',
        transition: 'background var(--dur) var(--ease-out)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Content container. Restraint: hairline border by default, shadow only when raised. */
function Card({
  elevation = 'flat',
  padding = 'md',
  interactive = false,
  children,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pad = {
    none: 0,
    sm: '14px',
    md: '20px',
    lg: '28px'
  }[padding] ?? '20px';
  const shadow = {
    flat: 'none',
    raised: 'var(--shadow-md)',
    floating: 'var(--shadow-lg)'
  }[elevation] ?? 'none';
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: pad,
      boxShadow: interactive && hover ? 'var(--shadow-lg)' : shadow,
      transform: interactive && hover ? 'translateY(-2px)' : 'none',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur) var(--ease-out), transform var(--dur) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/CategoryTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CategoryTile — the brand's signature image frame.
 * A big, subtle, stylized image *owns* the tile; a consistent vignette + amber grade
 * + type lockup ties every category image (generic "Sports" or specific "Cycling")
 * into one family. Falls back to a warm gradient wash + icon when no image is set.
 */
function CategoryTile({
  title,
  subtitle,
  image,
  icon,
  ratio = '4 / 3',
  size = 'md',
  selected = false,
  onClick,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = !!onClick;
  const titleSize = {
    sm: '1.125rem',
    md: '1.5rem',
    lg: '2rem'
  }[size] ?? '1.5rem';
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: ratio,
      borderRadius: 'var(--radius-xl)',
      cursor: interactive ? 'pointer' : 'default',
      border: selected ? '2.5px solid var(--accent)' : '2.5px solid transparent',
      boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transform: interactive && hover ? 'translateY(-3px)' : 'none',
      transition: 'transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
      background: 'var(--night-800)',
      ...style
    }
  }, rest), image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover && interactive ? 'scale(1.04)' : 'scale(1)',
      transition: 'transform var(--dur-slow) var(--ease-out)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(120% 120% at 30% 20%, var(--amber-500), var(--amber-700) 70%, var(--night-900))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--image-grade)'
    },
    "aria-hidden": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--image-vignette)'
    },
    "aria-hidden": true
  }), !image && icon && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '16px',
      right: '18px',
      color: 'rgba(255,255,255,0.55)'
    },
    "aria-hidden": true
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }
  }, subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--amber-300)'
    }
  }, subtitle), title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: titleSize,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      color: '#fff'
    }
  }, title), children));
}
Object.assign(__ds_scope, { CategoryTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/CategoryTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/App.jsx
try { (() => {
/* PubQuizPlanner — app cockpit recreation (quiz builder). Composes DS components. */
const {
  Button,
  IconButton,
  Badge,
  Tag,
  Card,
  Input,
  Textarea,
  Select,
  Tabs,
  Switch,
  Checkbox,
  CategoryTile,
  Dialog
} = window.PubQuizPlannerDesignSystem_e327fe;
const ROUNDS = [{
  n: 1,
  cat: 'Music',
  icon: 'music',
  q: 8,
  done: true
}, {
  n: 2,
  cat: 'Geography',
  icon: 'globe',
  q: 8,
  done: true
}, {
  n: 3,
  cat: 'Cinema',
  icon: 'film',
  q: 10,
  done: false
}, {
  n: 4,
  cat: 'Sport',
  icon: 'trophy',
  q: 8,
  done: false
}, {
  n: 5,
  cat: 'General',
  icon: 'brain',
  q: 6,
  done: false
}];
const QUESTIONS = [{
  n: 1,
  q: 'Which river flows through Vienna?',
  a: 'The Danube',
  diff: 'Easy'
}, {
  n: 2,
  q: 'What is the capital of Slovenia?',
  a: 'Ljubljana',
  diff: 'Medium'
}, {
  n: 3,
  q: 'Which country has the most natural lakes?',
  a: 'Canada',
  diff: 'Hard'
}, {
  n: 4,
  q: 'The Strait of Gibraltar connects the Atlantic to which sea?',
  a: 'The Mediterranean',
  diff: 'Easy'
}];
function Sidebar({
  active,
  setActive
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: '264px',
      flex: 'none',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.05rem',
      letterSpacing: '-0.03em',
      color: 'var(--text-strong)'
    }
  }, "PubQuizPlanner"), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    variant: "ghost",
    label: "Settings"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "settings"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.68rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, "Rounds"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, ROUNDS.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '0 12px'
    }
  }, ROUNDS.map(r => {
    const on = r.n === active;
    return /*#__PURE__*/React.createElement("button", {
      key: r.n,
      onClick: () => setActive(r.n),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        textAlign: 'left',
        padding: '10px 10px',
        marginBottom: '2px',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        background: on ? 'var(--accent-soft)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        flex: 'none',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--accent)' : 'var(--surface-inset)',
        color: on ? 'var(--text-on-accent)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": r.icon
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: on ? 'var(--accent-text)' : 'var(--text-strong)'
      }
    }, "Round ", r.n, " \xB7 ", r.cat), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--text-faint)'
      }
    }, r.q, " questions")), r.done && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle-2",
      style: {
        color: 'var(--success)',
        width: '16px'
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "plus"
    })
  }, "Add round")));
}
function Topbar({
  onExport
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.375rem',
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Tuesday Night Quiz"), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "Draft")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "eye"
    })
  }, "Preview"), /*#__PURE__*/React.createElement(Button, {
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "download"
    }),
    onClick: onExport
  }, "Export night")));
}
function QuestionsView() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, QUESTIONS.map(q => /*#__PURE__*/React.createElement(Card, {
    key: q.n,
    padding: "md",
    interactive: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '1.1rem',
      fontWeight: 600,
      color: 'var(--accent-text)',
      paddingTop: '2px'
    }
  }, String(q.n).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-strong)',
      marginBottom: '4px'
    }
  }, q.q), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.9rem',
      color: 'var(--text-muted)'
    }
  }, "Answer: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-body)',
      fontWeight: 500
    }
  }, q.a))), /*#__PURE__*/React.createElement(Badge, {
    tone: q.diff === 'Easy' ? 'success' : q.diff === 'Hard' ? 'danger' : 'neutral'
  }, q.diff), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    variant: "ghost",
    label: "Edit"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "pencil"
  }))))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "plus"
    }),
    style: {
      alignSelf: 'flex-start'
    }
  }, "Add question"));
}
function SlidesView() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(CategoryTile, {
    subtitle: "Round 3 \xB7 Title",
    title: "Cinema",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "film"
    }),
    ratio: "16 / 9"
  }), QUESTIONS.slice(0, 2).map(q => /*#__PURE__*/React.createElement("div", {
    key: q.n,
    "data-theme": "dark",
    style: {
      aspectRatio: '16/9',
      background: 'var(--night-800)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--night-600)',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.66rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--amber-300)'
    }
  }, "Question ", q.n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '1.05rem',
      lineHeight: 1.15,
      color: '#fff'
    }
  }, q.q))));
}
function AnswerView() {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    elevation: "raised",
    style: {
      maxWidth: '620px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.25rem',
      color: 'var(--text-strong)'
    }
  }, "Answer sheet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      color: 'var(--text-muted)'
    }
  }, "Prints clean in black & white")), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "printer",
    style: {
      width: '13px'
    }
  }), " B/W ready")), QUESTIONS.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.n,
    style: {
      display: 'flex',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px dashed var(--border-strong)',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      width: '24px'
    }
  }, q.n, "."), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: 'var(--text-body)',
      fontSize: '0.95rem'
    }
  }, q.q), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '120px',
      borderBottom: '1.5px solid var(--text-faint)'
    }
  }))));
}
function App() {
  const [round, setRound] = React.useState(3);
  const [tab, setTab] = React.useState('questions');
  const [exp, setExp] = React.useState(false);
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      fontFamily: 'var(--font-body)',
      background: 'var(--bg-page)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: round,
    setActive: setRound
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    onExport: () => setExp(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Round ", round, " \xB7 Cinema"), /*#__PURE__*/React.createElement(Tag, null, "Medium")), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: 'questions',
      label: 'Questions'
    }, {
      value: 'slides',
      label: 'Slides'
    }, {
      value: 'answers',
      label: 'Answer sheet'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: '18px 24px 32px'
    }
  }, tab === 'questions' && /*#__PURE__*/React.createElement(QuestionsView, null), tab === 'slides' && /*#__PURE__*/React.createElement(SlidesView, null), tab === 'answers' && /*#__PURE__*/React.createElement(AnswerView, null))), /*#__PURE__*/React.createElement(Dialog, {
    open: exp,
    onClose: () => setExp(false),
    title: "Export night",
    description: "Everything for all five rounds \u2014 consistently styled, ready to run.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setExp(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => setExp(false)
    }, "Export"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Presentation slides (16:9)",
    checked: true,
    readOnly: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Answer sheets (black & white)",
    checked: true,
    readOnly: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Host cheat sheet",
    checked: true,
    readOnly: true
  }))));
}
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Home.jsx
try { (() => {
/* PubQuizPlanner — marketing homepage recreation. Composes DS components. */
const {
  Button,
  Badge,
  Tag,
  CategoryTile,
  Card
} = window.PubQuizPlannerDesignSystem_e327fe;
const wrap = {
  maxWidth: 'var(--container)',
  margin: '0 auto',
  padding: '0 24px'
};
function Nav() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(251,247,240,0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '68px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.25rem',
      letterSpacing: '-0.03em',
      color: 'var(--text-strong)'
    }
  }, "PubQuizPlanner"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '28px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: '0.9375rem',
      color: 'var(--text-muted)',
      textDecoration: 'none',
      fontWeight: 500
    }
  }, "How it works"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: '0.9375rem',
      color: 'var(--text-muted)',
      textDecoration: 'none',
      fontWeight: 500
    }
  }, "Categories"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: '0.9375rem',
      color: 'var(--text-muted)',
      textDecoration: 'none',
      fontWeight: 500
    }
  }, "Pricing"), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Build a quiz"))));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    "data-theme": "dark",
    style: {
      background: 'var(--night-900)',
      color: 'var(--text-strong)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(80% 90% at 78% 15%, rgba(217,110,42,0.28), transparent 60%)'
    },
    "aria-hidden": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: '48px',
      alignItems: 'center',
      padding: '84px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "Free while in beta")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-4xl)',
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      margin: 0,
      color: '#fff'
    }
  }, "Run the whole quiz night.", /*#__PURE__*/React.createElement("br", null), "Not just the questions."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '1.1875rem',
      lineHeight: 1.6,
      color: 'var(--text-body)',
      maxWidth: '46ch',
      margin: '22px 0 32px'
    }
  }, "Turn a curated question database into ready-to-present slides, printed answer sheets and a host cheat sheet \u2014 in minutes. Polished on the projector, calm behind the scenes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-right"
    })
  }, "Build your first quiz"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "play"
    })
  }, "Watch a night")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      marginTop: '28px',
      flexWrap: 'wrap'
    }
  }, ['Deutsch', 'English', 'Nederlands', 'Polski', 'Svenska'].map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      letterSpacing: '0.04em'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement(CategoryTile, {
    subtitle: "Round 1",
    title: "Music",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "music"
    }),
    ratio: "1 / 1"
  }), /*#__PURE__*/React.createElement(CategoryTile, {
    subtitle: "Round 2",
    title: "Geography",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "globe"
    }),
    ratio: "1 / 1",
    style: {
      marginTop: '28px'
    }
  }), /*#__PURE__*/React.createElement(CategoryTile, {
    subtitle: "Round 3",
    title: "Cinema",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "film"
    }),
    ratio: "1 / 1"
  }), /*#__PURE__*/React.createElement(CategoryTile, {
    subtitle: "Round 4",
    title: "Sport",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trophy"
    }),
    ratio: "1 / 1",
    style: {
      marginTop: '28px'
    }
  }))));
}
const STEPS = [{
  icon: 'list-checks',
  t: 'Pick your rounds',
  d: 'Choose categories and difficulty. Pull from a curated database that keeps growing.'
}, {
  icon: 'wand-2',
  t: 'We build the night',
  d: 'Slides, answer sheets and a host cheat sheet are generated — consistently styled, every time.'
}, {
  icon: 'projector',
  t: 'Present anywhere',
  d: 'Run it from any screen. The room sees the show; your notes stay on the side.'
}];
function HowItWorks() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      ...wrap,
      padding: '88px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '52ch'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--accent-text)'
    }
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-2xl)',
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)',
      margin: '10px 0 0'
    }
  }, "Three steps from empty page to full night.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      marginTop: '40px'
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: s.t,
    padding: "lg",
    elevation: "raised"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '46px',
      height: '46px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--accent-soft)',
      color: 'var(--accent-text)',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s.icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      color: 'var(--text-faint)',
      marginBottom: '6px'
    }
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '1.375rem',
      letterSpacing: '-0.01em',
      color: 'var(--text-strong)',
      margin: '0 0 8px'
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.d)))));
}
const CATS = [{
  t: 'Sport',
  i: 'trophy'
}, {
  t: 'Music',
  i: 'music'
}, {
  t: 'History',
  i: 'landmark'
}, {
  t: 'Cinema',
  i: 'film'
}, {
  t: 'Geography',
  i: 'globe'
}, {
  t: 'Science',
  i: 'flask-conical'
}, {
  t: 'Food & Drink',
  i: 'utensils'
}, {
  t: 'Art',
  i: 'palette'
}];
function Categories() {
  const [active, setActive] = React.useState('Sport');
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--bg-sunken)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      padding: '88px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '48ch'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--accent-text)'
    }
  }, "Categories"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-2xl)',
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)',
      margin: '10px 0 0'
    }
  }, "Start generic, go specific."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: 'var(--text-muted)',
      margin: '10px 0 0'
    }
  }, "Every category has a generic look from day one, then deepens into subtopics \u2014 Sport becomes Cycling, Football, Tennis \u2014 as the library grows."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      margin: '28px 0 24px'
    }
  }, CATS.map(c => /*#__PURE__*/React.createElement(Tag, {
    key: c.t,
    selected: active === c.t,
    onClick: () => setActive(c.t)
  }, c.t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px'
    }
  }, CATS.slice(0, 4).map(c => /*#__PURE__*/React.createElement(CategoryTile, {
    key: c.t,
    title: c.t,
    subtitle: c.t === active ? 'Selected' : 'Category',
    selected: c.t === active,
    onClick: () => setActive(c.t),
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": c.i
    })
  })))));
}
function CTA() {
  return /*#__PURE__*/React.createElement("section", {
    "data-theme": "dark",
    style: {
      background: 'var(--night-800)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      padding: '80px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--text-3xl)',
      letterSpacing: '-0.02em',
      color: '#fff',
      margin: 0
    }
  }, "Your next quiz night is 10 minutes away."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '1.125rem',
      color: 'var(--text-body)',
      margin: '16px auto 28px',
      maxWidth: '44ch'
    }
  }, "Free while we\u2019re in beta. Keep your own branding on every slide."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-right"
    })
  }, "Build a quiz \u2014 free")));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--night-900)',
      color: 'var(--text-faint)'
    },
    "data-theme": "dark"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      padding: '40px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '1.1rem',
      color: '#fff',
      letterSpacing: '-0.03em'
    }
  }, "PubQuizPlanner"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8125rem'
    }
  }, "\xA9 2026 \xB7 Deutsch \xB7 English \xB7 Nederlands \xB7 Polski \xB7 Svenska")));
}
function Home() {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(HowItWorks, null), /*#__PURE__*/React.createElement(Categories, null), /*#__PURE__*/React.createElement(CTA, null), /*#__PURE__*/React.createElement(Footer, null));
}
window.Home = Home;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Home.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CategoryTile = __ds_scope.CategoryTile;

})();
