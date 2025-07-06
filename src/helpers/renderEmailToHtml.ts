import { render } from '@react-email/components';

export async function renderEmailToHtml(component: React.ReactElement): Promise<string> {
    return render(component);
}
