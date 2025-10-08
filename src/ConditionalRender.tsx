import { ReactNode } from 'react';

interface ConditionalRenderProps {
	condition: boolean;
	children: ReactNode;
}

export const ConditionalRender = ({ condition, children }: ConditionalRenderProps) => {
	return condition ? <>{children}</> : null;
};

export default ConditionalRender;
