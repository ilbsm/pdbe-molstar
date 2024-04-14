import { PluginStateObject } from 'Molstar/mol-plugin-state/objects';
import { PluginContext } from 'Molstar/mol-plugin/context';
import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { StateTransformer } from 'Molstar/mol-state/transformer';
import { Task } from 'Molstar/mol-task';

import {
    TriangleRepresentation,
    TriangleParams
} from './representation';

const CreateTransformer = StateTransformer.builderFactory('surface-plugin');


export const CreateTriangle = CreateTransformer({
    name: 'create-triangle',
    display: 'Triangle',
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Representation3D,
    params: {
        index: PD.Numeric(0),
        vertices: PD.Value([] as number[]),
        size: PD.Numeric(1.6)
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin: PluginContext) {
        return Task.create('Triangle', async ctx => {
            const repr = TriangleRepresentation({ webgl: plugin.canvas3d?.webgl, ...plugin.representation.structure.themes }, () => TriangleParams);
            await repr.createOrUpdate({}, params).runInContext(ctx);
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: a }, { label: `Triangle ${params.index}` });
        });
    }
});