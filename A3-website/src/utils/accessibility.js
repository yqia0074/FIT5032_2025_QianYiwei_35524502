/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Provides keyboard navigation, focus management, and ARIA support
 */

// Focus management utilities
export class FocusManager {
  constructor() {
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    this.trapStack = []
  }

  // Get all focusable elements within a container
  getFocusableElements(container = document) {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter(el => this.isVisible(el))
  }

  // Check if element is visible
  isVisible(element) {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0
  }

  // Trap focus within a container (for modals, dropdowns)
  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
      
      // Escape key to close modal/dropdown
      if (e.key === 'Escape') {
        this.releaseFocus()
        // Dispatch custom event for components to handle
        container.dispatchEvent(new CustomEvent('escape-pressed'))
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    // Store trap info for cleanup
    this.trapStack.push({
      container,
      handleKeyDown,
      previousFocus: document.activeElement
    })

    // Focus first element
    firstElement.focus()
  }

  // Release focus trap
  releaseFocus() {
    const trap = this.trapStack.pop()
    if (trap) {
      trap.container.removeEventListener('keydown', trap.handleKeyDown)
      // Restore previous focus
      if (trap.previousFocus && this.isVisible(trap.previousFocus)) {
        trap.previousFocus.focus()
      }
    }
  }

  // Move focus to next/previous element
  moveFocus(direction = 'next', container = document) {
    const focusableElements = this.getFocusableElements(container)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    
    let nextIndex
    if (direction === 'next') {
      nextIndex = currentIndex + 1
      if (nextIndex >= focusableElements.length) nextIndex = 0
    } else {
      nextIndex = currentIndex - 1
      if (nextIndex < 0) nextIndex = focusableElements.length - 1
    }
    
    focusableElements[nextIndex]?.focus()
  }
}

// ARIA utilities
export class AriaManager {
  // Set ARIA attributes
  static setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        element.removeAttribute(key)
      } else {
        element.setAttribute(key, value)
      }
    })
  }

  // Announce to screen readers
  static announce(message, priority = 'polite') {
    const announcer = document.getElementById('aria-live-announcer') || this.createAnnouncer()
    
    // Clear previous message
    announcer.textContent = ''
    
    // Set new message after a brief delay to ensure it's announced
    setTimeout(() => {
      announcer.textContent = message
      announcer.setAttribute('aria-live', priority)
    }, 100)
    
    // Clear message after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }

  // Create live region for announcements
  static createAnnouncer() {
    const announcer = document.createElement('div')
    announcer.id = 'aria-live-announcer'
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(announcer)
    return announcer
  }

  // Manage expanded/collapsed states
  static toggleExpanded(trigger, target) {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
    const newState = !isExpanded
    
    trigger.setAttribute('aria-expanded', newState)
    target.setAttribute('aria-hidden', !newState)
    
    if (newState) {
      target.style.display = 'block'
    } else {
      target.style.display = 'none'
    }
    
    return newState
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  constructor() {
    this.handlers = new Map()
  }

  // Add keyboard shortcuts
  addShortcut(key, callback, options = {}) {
    const { ctrlKey = false, altKey = false, shiftKey = false } = options
    
    const handler = (e) => {
      if (e.key === key && 
          e.ctrlKey === ctrlKey && 
          e.altKey === altKey && 
          e.shiftKey === shiftKey) {
        e.preventDefault()
        callback(e)
      }
    }
    
    document.addEventListener('keydown', handler)
    this.handlers.set(`${key}-${ctrlKey}-${altKey}-${shiftKey}`, handler)
  }

  // Remove keyboard shortcut
  removeShortcut(key, options = {}) {
    const { ctrlKey = false, altKey = false, shiftKey = false } = options
    const handlerKey = `${key}-${ctrlKey}-${altKey}-${shiftKey}`
    
    const handler = this.handlers.get(handlerKey)
    if (handler) {
      document.removeEventListener('keydown', handler)
      this.handlers.delete(handlerKey)
    }
  }

  // Arrow key navigation for lists/grids
  setupArrowNavigation(container, options = {}) {
    const { 
      itemSelector = '[role="option"], [role="menuitem"], .nav-item',
      orientation = 'vertical',
      wrap = true 
    } = options

    container.addEventListener('keydown', (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector))
      const currentIndex = items.indexOf(document.activeElement)
      
      if (currentIndex === -1) return
      
      let nextIndex = currentIndex
      
      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical') {
            e.preventDefault()
            nextIndex = currentIndex + 1
            if (nextIndex >= items.length && wrap) nextIndex = 0
          }
          break
          
        case 'ArrowUp':
          if (orientation === 'vertical') {
            e.preventDefault()
            nextIndex = currentIndex - 1
            if (nextIndex < 0 && wrap) nextIndex = items.length - 1
          }
          break
          
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            e.preventDefault()
            nextIndex = currentIndex + 1
            if (nextIndex >= items.length && wrap) nextIndex = 0
          }
          break
          
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            e.preventDefault()
            nextIndex = currentIndex - 1
            if (nextIndex < 0 && wrap) nextIndex = items.length - 1
          }
          break
          
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
          
        case 'End':
          e.preventDefault()
          nextIndex = items.length - 1
          break
      }
      
      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus()
      }
    })
  }
}

// Color contrast utilities
export class ContrastChecker {
  // Calculate relative luminance
  static getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Calculate contrast ratio
  static getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1)
    const lum2 = this.getLuminance(...color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Check if contrast meets WCAG AA standards
  static meetsWCAG_AA(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }

  // Parse hex color to RGB
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }
}

// Skip links utility
export class SkipLinks {
  static create() {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 0 0 4px 4px;
    `
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0'
    })
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })
    
    document.body.insertBefore(skipLink, document.body.firstChild)
  }
}

// Initialize accessibility features
export function initializeAccessibility() {
  // Create ARIA live region
  AriaManager.createAnnouncer()
  
  // Create skip links
  SkipLinks.create()
  
  // Add main content landmark if not exists
  if (!document.getElementById('main-content')) {
    const main = document.querySelector('main') || document.querySelector('.container')
    if (main) {
      main.id = 'main-content'
      main.setAttribute('role', 'main')
    }
  }
  
  // Enhance form labels
  document.querySelectorAll('input, select, textarea').forEach(input => {
    if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      const label = document.querySelector(`label[for="${input.id}"]`)
      if (label) {
        input.setAttribute('aria-labelledby', label.id || `label-${input.id}`)
        if (!label.id) label.id = `label-${input.id}`
      }
    }
  })
  
  // Add focus indicators
  const style = document.createElement('style')
  style.textContent = `
    .skip-link:focus {
      top: 0 !important;
    }
    
    *:focus {
      outline: 2px solid #005fcc;
      outline-offset: 2px;
    }
    
    button:focus,
    input:focus,
    select:focus,
    textarea:focus,
    a:focus {
      box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.3);
    }
    
    .btn:focus {
      box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.3) !important;
    }
  `
  document.head.appendChild(style)
}

// Export singleton instances
export const focusManager = new FocusManager()
export const keyboardNav = new KeyboardNavigation()