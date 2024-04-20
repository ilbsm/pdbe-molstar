import { PluginStateObject } from 'Molstar/mol-plugin-state/objects';
import { PluginContext } from 'Molstar/mol-plugin/context';
import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { StateTransformer } from 'Molstar/mol-state/transformer';
import { Task } from 'Molstar/mol-task';

import {
    BondRepresentation,
    BondParams
} from './representation';

const CreateTransformer = StateTransformer.builderFactory('bond-plugin');


export const CreateBond = CreateTransformer({
    name: 'create-bond',
    display: 'Bond',
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Representation3D,
    params: {
        index: PD.Numeric(0),
        begin: PD.Value([] as Array<number>),
        end: PD.Value([] as Array<number>),
        size: PD.Numeric(1),
        color: PD.Value([255, 220, 0] as Array<number>)
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin: PluginContext) {
        return Task.create('Bond', async ctx => {
            const repr = BondRepresentation({ webgl: plugin.canvas3d?.webgl, ...plugin.representation.structure.themes }, () => BondParams);
            await repr.createOrUpdate({}, params).runInContext(ctx);
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: a }, { label: `Bond ${params.index}` });
        });
    }
});