export const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: '#4da3ff',
    colorBackground: '#151c2b',
    colorInputBackground: '#1a2233',
    colorText: 'rgba(255, 255, 255, 0.92)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
    colorTextOnPrimaryBackground: '#0b1220',
    colorDanger: '#ff5c7a',
    colorSuccess: '#33d69f',
    colorInputText: 'rgba(255, 255, 255, 0.92)',
    colorNeutral: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  elements: {
    card: {
      backgroundColor: '#151c2b',
      border: '1px solid rgba(255, 255, 255, 0.085)',
      borderRadius: '16px',
      boxShadow: '0 14px 42px rgba(0, 0, 0, 0.38)',
    },
    headerTitle: {
      color: 'rgba(255, 255, 255, 0.92)',
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    socialButtonsBlockButton: {
      borderColor: 'rgba(255, 255, 255, 0.085)',
      backgroundColor: '#1a2233',
      color: 'rgba(255, 255, 255, 0.92)',
      '&:hover': {
        backgroundColor: '#212b40',
      },
    },
    otpCodeFieldInput: {
      backgroundColor: '#1a2233',
      borderColor: 'rgba(255, 255, 255, 0.085)',
      color: 'rgba(255, 255, 255, 0.92)',
      caretColor: 'rgba(255, 255, 255, 0.92)',
      '&:focus': {
        borderColor: '#4da3ff',
        boxShadow: '0 0 0 3px rgba(77, 163, 255, 0.14)',
      },
    },
    formFieldInput: {
      backgroundColor: '#1a2233',
      borderColor: 'rgba(255, 255, 255, 0.085)',
      color: 'rgba(255, 255, 255, 0.92)',
      '&:focus': {
        borderColor: '#4da3ff',
        boxShadow: '0 0 0 3px rgba(77, 163, 255, 0.14)',
      },
    },
    formFieldLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    formButtonPrimary: {
      backgroundColor: '#4da3ff',
      color: '#0b1220',
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#7bc1ff',
      },
    },
    footer: {
      backgroundColor: 'transparent',
      background: 'transparent',
    },
    footerActionText: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    footerActionLink: {
      color: '#4da3ff',
      '&:hover': {
        color: '#7bc1ff',
      },
    },
    dividerLine: {
      backgroundColor: 'rgba(255, 255, 255, 0.085)',
    },
    dividerText: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    identityPreview: {
      backgroundColor: '#1a2233',
      borderColor: 'rgba(255, 255, 255, 0.085)',
    },
    formFieldSuccessText: {
      color: '#33d69f',
    },
    formFieldErrorText: {
      color: '#ff5c7a',
    },
    alertText: {
      color: 'rgba(255, 255, 255, 0.92)',
    },
  },
} as const;
