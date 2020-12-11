/**
 * External dependencies
 */
import mergeRefs from 'react-merge-refs';

/**
 * WordPress dependencies
 */
import { useRef, useEffect } from '@wordpress/element';
import { ESCAPE } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import useConstrainedTabbing from '../use-constrained-tabbing';
import useFocusOnMount from '../use-focus-on-mount';
import useFocusReturn from '../use-focus-return';
import useFocusOutside from '../use-focus-outside';
import useCallbackRef from '../use-callback-ref';

/**
 * Returns a ref and props to apply to a dialog wrapper to enable the following behaviors:
 *  - constrained tabbing.
 *  - focus on mount.
 *  - return focus on unmount.
 *  - focus outside.
 *
 * @param {Object} options Dialog Options.
 */
function useDialog( options ) {
	const currentOptions = useRef();
	useEffect( () => {
		currentOptions.current = options;
	}, [ options.onClose ] );
	const constrainedTabbingRef = useConstrainedTabbing();
	const focusOnMountRef = useFocusOnMount( options.focusOnMount );
	const focusReturnRef = useFocusReturn();
	const focusOutsideProps = useFocusOutside( ( event ) => {
		// This unstable prop  is here only to manage backward compatibility
		// for the Popover component otherwise, the onClose should be enough.
		if ( currentOptions.current.__unstableOnClose ) {
			currentOptions.current.__unstableOnClose( 'focus-outside', event );
		} else if ( currentOptions.current.onClose ) {
			currentOptions.current.onClose();
		}
	} );
	const closeOnEscapeRef = useCallbackRef( ( node ) => {
		if ( ! node ) {
			return;
		}

		node.addEventListener( 'keydown', ( event ) => {
			// Close on escape
			if ( event.keyCode === ESCAPE && currentOptions.current.onClose ) {
				event.stopPropagation();
				currentOptions.current.onClose();
			}
		} );

		node.addEventListener( 'mousedown', ( event ) => {
			// I'm not really certain what this is for but it matches the previous behavior.
			event.stopPropagation();
		} );
	}, [] );

	return [
		mergeRefs( [
			constrainedTabbingRef,
			focusOnMountRef,
			focusReturnRef,
			closeOnEscapeRef,
		] ),
		focusOutsideProps,
	];
}

export default useDialog;
